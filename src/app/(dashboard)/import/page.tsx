import React from 'react';
import { requireAuth } from '@/modules/auth/components/SessionGuard';
import { applicationRepository } from '@/database/repositories/application.repository';
import { db } from '@/database/db';
import { CSVImportControl } from '@/features/applications/components/CSVImportControl';

export default async function ImportPage() {
  const session = await requireAuth();

  // Load applications belonging to this user
  const appsResult = await applicationRepository.findManyForUser(session.user.id);
  const apps = appsResult.data;

  // Load entities from these applications with their fields
  const appIds = apps.map((app) => app.id);
  const entities = appIds.flatMap(appId => db.getEntitiesByApp(appId));

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-6">
      <CSVImportControl apps={apps} entities={entities} />
    </div>
  );
}
