import * as fs from 'fs';
import * as path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}

export interface Application {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'draft';
  icon: string;
}

export interface EntityField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  required: boolean;
  options?: string[]; // for select dropdowns
}

export interface Entity {
  id: string;
  appId: string;
  name: string;
  slug: string; // e.g. "customers", "tasks"
  description: string;
  fields: EntityField[];
}

export interface AppRecord {
  id: string;
  appId: string;
  entitySlug: string;
  data: globalThis.Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  userId?: string;
  timestamp: string;
}

interface DatabaseSchema {
  users: User[];
  applications: Application[];
  entities: Entity[];
  records: AppRecord[];
  auditLogs: AuditLog[];
}

const DB_FILE = path.join(process.cwd(), 'appforge_db.json');

class DatabaseEngine {
  private data: DatabaseSchema = {
    users: [],
    applications: [],
    entities: [],
    records: [],
    auditLogs: [],
  };

  constructor() {
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(fileContent);
      } else {
        this.seed();
      }
    } catch (error) {
      console.error('Error loading database, seeding fallback...', error);
      this.seed();
    }
  }

  public save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving database to file:', error);
    }
  }

  private seed() {
    // 1. Create default admin user: password is 'ForgeAppSecure99!'
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync('ForgeAppSecure99!', salt);

    const defaultAdmin: User = {
      id: 'usr_admin',
      email: 'admin@example.com',
      name: 'System Admin',
      passwordHash,
      role: 'administrator',
    };

    // 2. Sample application: Sales CRM
    const appSalesCRM: Application = {
      id: 'app_sales_crm',
      name: 'Sales CRM & pipeline',
      description: 'Dynamic customer relationship management application for managing leads, deals, and communication history.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      icon: 'Briefcase',
    };

    // Sample application: Task Board
    const appTaskTracker: Application = {
      id: 'app_task_tracker',
      name: 'Operations Task Board',
      description: 'Sprint coordination system to track high-priority initiatives, team assignments, and deadlines.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      icon: 'CheckSquare',
    };

    // 3. Create CRM entities
    const entityCustomer: Entity = {
      id: 'ent_customers',
      appId: 'app_sales_crm',
      name: 'Customers',
      slug: 'customers',
      description: 'Core profile listings of prospective active accounts.',
      fields: [
        { name: 'FullName', type: 'string', required: true },
        { name: 'Company', type: 'string', required: true },
        { name: 'Email', type: 'string', required: true },
        { name: 'Revenue', type: 'number', required: false },
        { name: 'Status', type: 'select', required: true, options: ['Lead', 'Qualified', 'Negotiation', 'Closed Won', 'Closed Lost'] },
        { name: 'RegisterDate', type: 'date', required: true },
      ],
    };

    const entityDeal: Entity = {
      id: 'ent_deals',
      appId: 'app_sales_crm',
      name: 'Deals',
      slug: 'deals',
      description: 'Track deal sized, values, and progression states.',
      fields: [
        { name: 'DealName', type: 'string', required: true },
        { name: 'Value', type: 'number', required: true },
        { name: 'ClosingDate', type: 'date', required: true },
        { name: 'Priority', type: 'select', required: true, options: ['Low', 'Medium', 'High'] },
      ],
    };

    // Create Task Tracker entities
    const entityTask: Entity = {
      id: 'ent_tasks',
      appId: 'app_task_tracker',
      name: 'Tasks',
      slug: 'tasks',
      description: 'Individual sprint task units.',
      fields: [
        { name: 'Title', type: 'string', required: true },
        { name: 'Assignee', type: 'string', required: true },
        { name: 'DueDate', type: 'date', required: true },
        { name: 'Points', type: 'number', required: true },
        { name: 'Stage', type: 'select', required: true, options: ['Backlog', 'In Dev', 'Testing', 'Done'] },
      ],
    };

    // 4. Seeding records
    const recordsCRM: AppRecord[] = [
      {
        id: 'rec_crm_1',
        appId: 'app_sales_crm',
        entitySlug: 'customers',
        data: {
          FullName: 'Sarah Jenkins',
          Company: 'Apex Global Inc.',
          Email: 'sarah.j@apexglobal.com',
          Revenue: 1250000,
          Status: 'Closed Won',
          RegisterDate: '2026-01-15',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_crm_2',
        appId: 'app_sales_crm',
        entitySlug: 'customers',
        data: {
          FullName: 'Michael Chang',
          Company: 'Vortex Capital',
          Email: 'chang@vortex.io',
          Revenue: 850000,
          Status: 'Negotiation',
          RegisterDate: '2026-03-24',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_crm_3',
        appId: 'app_sales_crm',
        entitySlug: 'customers',
        data: {
          FullName: 'Emma Watson',
          Company: 'Horizon Media',
          Email: 'emma@horizon.com',
          Revenue: 480000,
          Status: 'Qualified',
          RegisterDate: '2026-04-12',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_deal_1',
        appId: 'app_sales_crm',
        entitySlug: 'deals',
        data: {
          DealName: 'Enterprise SaaS Upgrade',
          Value: 45000,
          ClosingDate: '2026-06-30',
          Priority: 'High',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_deal_2',
        appId: 'app_sales_crm',
        entitySlug: 'deals',
        data: {
          DealName: 'Annual Maintenance SLA',
          Value: 12000,
          ClosingDate: '2026-08-15',
          Priority: 'Medium',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    const recordsTasks: AppRecord[] = [
      {
        id: 'rec_task_1',
        appId: 'app_task_tracker',
        entitySlug: 'tasks',
        data: {
          Title: 'Integrate OAuth with Strava Provider',
          Assignee: 'Devin Larson',
          DueDate: '2026-06-05',
          Points: 5,
          Stage: 'In Dev',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_task_2',
        appId: 'app_task_tracker',
        entitySlug: 'tasks',
        data: {
          Title: 'Design PWA caching service workers',
          Assignee: 'Elena Rostova',
          DueDate: '2026-05-28',
          Points: 3,
          Stage: 'Done',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'rec_task_3',
        appId: 'app_task_tracker',
        entitySlug: 'tasks',
        data: {
          Title: 'Perform load tests on core VM engine',
          Assignee: 'Marcus Vance',
          DueDate: '2026-06-12',
          Points: 8,
          Stage: 'Backlog',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    // Seed data config
    this.data = {
      users: [defaultAdmin],
      applications: [appSalesCRM, appTaskTracker],
      entities: [entityCustomer, entityDeal, entityTask],
      records: [...recordsCRM, ...recordsTasks],
      auditLogs: [
        {
          id: 'log_001',
          action: 'SYSTEM_BOOTUP',
          details: 'Application server initialized, loaded metadata database.',
          timestamp: new Date().toISOString(),
        },
        {
          id: 'log_002',
          action: 'SEED_DATA_LOAD',
          details: 'Loaded default CRM and Task tracker application blueprints.',
          timestamp: new Date().toISOString(),
        }
      ],
    };

    this.save();
  }

  public reset() {
    this.seed();
    return true;
  }

  // --- Repo APIS ---
  public getUsers() {
    this.load();
    return this.data.users;
  }

  public getUserByEmail(email: string) {
    this.load();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public createUser(user: Omit<User, 'id'>): User {
    this.load();
    const newUser = {
      ...user,
      id: 'usr_' + Math.random().toString(36).substr(2, 9),
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  public getApplications() {
    this.load();
    return this.data.applications;
  }

  public getApplicationById(id: string) {
    this.load();
    return this.data.applications.find(a => a.id === id);
  }

  public createApplication(app: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Application {
    this.load();
    const newApp: Application = {
      ...app,
      id: 'app_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.applications.push(newApp);
    this.save();
    return newApp;
  }

  public deleteApplication(id: string) {
    this.load();
    this.data.applications = this.data.applications.filter(a => a.id !== id);
    this.data.entities = this.data.entities.filter(e => e.appId !== id);
    this.data.records = this.data.records.filter(r => r.appId !== id);
    this.save();
    return true;
  }

  public getEntities() {
    this.load();
    return this.data.entities;
  }

  public getEntitiesByApp(appId: string) {
    this.load();
    return this.data.entities.filter(e => e.appId === appId);
  }

  public getEntityBySlug(appId: string, slug: string) {
    this.load();
    return this.data.entities.find(e => e.appId === appId && e.slug.toLowerCase() === slug.toLowerCase());
  }

  public createEntity(entity: Omit<Entity, 'id'>): Entity {
    this.load();
    const newEntity: Entity = {
      ...entity,
      id: 'ent_' + Math.random().toString(36).substr(2, 9),
    };
    this.data.entities.push(newEntity);
    this.save();
    return newEntity;
  }

  public deleteEntity(id: string) {
    this.load();
    const entity = this.data.entities.find(e => e.id === id);
    if (!entity) return false;
    this.data.entities = this.data.entities.filter(e => e.id !== id);
    this.data.records = this.data.records.filter(r => !(r.appId === entity.appId && r.entitySlug === entity.slug));
    this.save();
    return true;
  }

  public getRecords(appId: string, entitySlug: string) {
    this.load();
    return this.data.records.filter(r => r.appId === appId && r.entitySlug.toLowerCase() === entitySlug.toLowerCase());
  }

  public createRecord(record: Omit<AppRecord, 'id' | 'createdAt' | 'updatedAt'>): AppRecord {
    this.load();
    const newRecord: AppRecord = {
      ...record,
      id: 'rec_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.records.push(newRecord);
    this.save();
    return newRecord;
  }

  public updateRecord(id: string, data: globalThis.Record<string, any>): AppRecord | null {
    this.load();
    const recordIndex = this.data.records.findIndex(r => r.id === id);
    if (recordIndex === -1) return null;
    const existing = this.data.records[recordIndex];
    const updated: AppRecord = {
      ...existing,
      data: {
        ...existing.data,
        ...data,
      },
      updatedAt: new Date().toISOString(),
    };
    this.data.records[recordIndex] = updated;
    this.save();
    return updated;
  }

  public deleteRecord(id: string) {
    this.load();
    this.data.records = this.data.records.filter(r => r.id !== id);
    this.save();
    return true;
  }

  public getAuditLogs() {
    this.load();
    return this.data.auditLogs;
  }

  public addAuditLog(action: string, details: string, userId?: string) {
    this.load();
    const newLog: AuditLog = {
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      action,
      details,
      userId,
      timestamp: new Date().toISOString(),
    };
    this.data.auditLogs.unshift(newLog); // Put new logs first
    this.save();
    return newLog;
  }
}

export const db = new DatabaseEngine();
