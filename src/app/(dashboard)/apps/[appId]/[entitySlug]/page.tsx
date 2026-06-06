import React from 'react';
import { requireAuth } from '@/modules/auth/components/SessionGuard';
import { applicationRepository } from '@/database/repositories/application.repository';
import { entityRepository } from '@/database/repositories/entity.repository';
import { fieldRepository } from '@/database/repositories/field.repository';
import { recordRepository } from '@/database/repositories/record.repository';
import { EntityRecordsView } from '@/features/applications/components/EntityRecordsView';
import { redirect } from 'next/navigation';

export default async function EntityPage({
  params,
}: {
  params: Promise<{ appId: string; entitySlug: string }>;
}) {
  const { appId, entitySlug } = await params;
  const session = await requireAuth();

  // Load parent application
  const app = await applicationRepository.findByIdForUser(appId, session.user.id);
  if (!app) {
    redirect('/apps');
  }

  // Load target schema entity metadata
  const entity = await entityRepository.findBySlug(appId, entitySlug);
  if (!entity) {
    redirect(`/apps/${appId}`);
  }

  // Load current entity schema fields and record datasets
  const fields = await fieldRepository.findAllForEntity(entity.id);
  const records = await recordRepository.findMany(appId, entity.slug);

  return (
    <div className="max-w-6xl mx-auto py-6">
      <EntityRecordsView 
        app={app} 
        entity={entity} 
        initialFields={fields} 
        initialRecords={records} 
      />
    </div>
  );
}
