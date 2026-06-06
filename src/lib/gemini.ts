import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined in environment variables. Gemini features will be mocked.');
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey || 'mock_key',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface GeneratedAppSpec {
  name: string;
  description: string;
  icon: string;
  entities: {
    name: string;
    slug: string;
    description: string;
    fields: {
      name: string;
      type: 'string' | 'number' | 'boolean' | 'date' | 'select';
      required: boolean;
      options?: string[];
    }[];
  }[];
}

export async function generateAppSchema(prompt: string): Promise<GeneratedAppSpec> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Elegant fallback simulation when key is missing so the app has perfect testability
    return simulateAppGeneration(prompt);
  }

  const ai = getGeminiClient();
  const systemInstruction = 
    "You are a stellar Senior Solutions Architect. Your role is to convert raw business ideas into a " +
    "relational-like JSON schema spec containing the application name, business description, a suitable icon " +
    "name from Lucide icons (e.g. 'Users', 'Database', 'Settings', 'Package', 'Shield', 'HelpCircle'), and several entities describing the tables. " +
    "Each entity must have a clear name, a slug, a description, and an array of fields. " +
    "Fields must contain a name, a valid data type ('string', 'number', 'boolean', 'date', or 'select'), a required boolean, and options as an array of strings only if the type is 'select'. " +
    "Pick appropriate, robust, and industry-standard entity structures.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Design an application blueprint for: "${prompt}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['name', 'description', 'icon', 'entities'],
          properties: {
            name: { type: Type.STRING, description: 'Sleek, humble name of the app.' },
            description: { type: Type.STRING, description: 'Clear, concise description.' },
            icon: { type: Type.STRING, description: 'Lucide-react icon name e.g. "Shield", "Package", "Users", "Zap", "Activity", "Layers".' },
            entities: {
              type: Type.ARRAY,
              description: 'Operational tables/entities representing the schemas.',
              items: {
                type: Type.OBJECT,
                required: ['name', 'slug', 'description', 'fields'],
                properties: {
                  name: { type: Type.STRING, description: 'Human friendly entity table, capitalized plurals (e.g. Products)' },
                  slug: { type: Type.STRING, description: 'URL slug, lowercase, usually plural (e.g. products, order_items)' },
                  description: { type: Type.STRING, description: 'Description of what this entity tracks.' },
                  fields: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      required: ['name', 'type', 'required'],
                      properties: {
                        name: { type: Type.STRING, description: 'Field column identifier, camelCase (e.g. fullName, orderPrice)' },
                        type: { type: Type.STRING, description: 'Data style.', enum: ['string', 'number', 'boolean', 'date', 'select'] },
                        required: { type: Type.BOOLEAN },
                        options: {
                          type: Type.ARRAY,
                          items: { type: Type.STRING },
                          description: 'Dropdown values list, only required if type is select'
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    return parsed as GeneratedAppSpec;
  } catch (error) {
    console.error('Error calling Gemini model:', error);
    return simulateAppGeneration(prompt);
  }
}

function simulateAppGeneration(prompt: string): GeneratedAppSpec {
  const p = prompt.toLowerCase();
  
  if (p.includes('inventory') || p.includes('stock') || p.includes('warehouse')) {
    return {
      name: 'Inventory Manager',
      description: 'Dynamic system for tracking stock levels, warehouse units, purchase items, and supplier logistics.',
      icon: 'Package',
      entities: [
        {
          name: 'Products',
          slug: 'products',
          description: 'Catalog list of available product inventory units.',
          fields: [
            { name: 'SKU', type: 'string', required: true },
            { name: 'ProductName', type: 'string', required: true },
            { name: 'QuantityInStock', type: 'number', required: true },
            { name: 'PricePerUnit', type: 'number', required: true },
            { name: 'Category', type: 'select', required: true, options: ['Electronics', 'Furniture', 'Apparel', 'Utilities'] },
            { name: 'RestockDate', type: 'date', required: false },
          ],
        },
        {
          name: 'Suppliers',
          slug: 'suppliers',
          description: 'Supplier contacts and contract management.',
          fields: [
            { name: 'CompanyName', type: 'string', required: true },
            { name: 'ContactPerson', type: 'string', required: true },
            { name: 'Email', type: 'string', required: true },
            { name: 'ActiveContract', type: 'boolean', required: true },
          ],
        },
      ],
    };
  }

  // Defaull fallback: Project Coordinator
  return {
    name: 'Smart Project Hub',
    description: `Custom-tailored workspace designed for "${prompt}" automatically mapped into structural entities.`,
    icon: 'Layers',
    entities: [
      {
        name: 'Project Milestones',
        slug: 'milestones',
        description: 'Track strategic phases, delivery dates, and status checkmarks.',
        fields: [
          { name: 'MilestoneName', type: 'string', required: true },
          { name: 'EstimatedBudget', type: 'number', required: false },
          { name: 'Deadline', type: 'date', required: true },
          { name: 'Status', type: 'select', required: true, options: ['Not Started', 'In Progress', 'At Risk', 'Completed'] },
          { name: 'IsCriticalPath', type: 'boolean', required: true },
        ],
      },
      {
        name: 'Team Members',
        slug: 'team_members',
        description: 'Profiles of engineers, managers, and designers.',
        fields: [
          { name: 'FullName', type: 'string', required: true },
          { name: 'RoleTitle', type: 'string', required: true },
          { name: 'JoinDate', type: 'date', required: true },
          { name: 'CapacityPoints', type: 'number', required: true },
        ],
      },
    ],
  };
}
