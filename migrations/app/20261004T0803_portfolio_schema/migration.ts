#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract';
import endContract from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Collaborator',
        columns: [
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('profileUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Project',
        columns: [
          col('coverImageKey', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('endedAt', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('featuredRank', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('githubUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('liveUrl', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('metadata', 'jsonb', {
            notNull: true,
            default: lit({}),
            codecRef: { codecId: 'pg/jsonb@1' },
          }),
          col('published', 'bool', {
            notNull: true,
            default: lit(false),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('startedAt', 'date', { codecRef: { codecId: 'pg/date-string@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('ONGOING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('teamName', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('title', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Project_status_check_5a6c300b',
            "\"status\" IN ('ONGOING', 'COMPLETED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProjectCollaborator',
        columns: [
          col('collaboratorId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('projectId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('role', 'text', { codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['projectId', 'collaboratorId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProjectImage',
        columns: [
          col('alt', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('key', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('order', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('projectId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'ProjectSkill',
        columns: [
          col('projectId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('skillId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['projectId', 'skillId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Skill',
        columns: [
          col('categoryId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'SkillCategory',
        columns: [
          col('confidence', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('overview', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('slug', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('topRank', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Project',
        constraint: 'Project_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Project',
        constraint: 'Project_featuredRank_key',
        columns: ['featuredRank'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Skill',
        constraint: 'Skill_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SkillCategory',
        constraint: 'SkillCategory_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'SkillCategory',
        constraint: 'SkillCategory_topRank_key',
        columns: ['topRank'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectCollaborator',
        index: 'ProjectCollaborator_collaboratorId_idx_bf803da6',
        columns: ['collaboratorId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectCollaborator',
        index: 'ProjectCollaborator_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectImage',
        index: 'ProjectImage_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectSkill',
        index: 'ProjectSkill_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectSkill',
        index: 'ProjectSkill_skillId_idx_6e19993d',
        columns: ['skillId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Skill',
        index: 'Skill_categoryId_idx_15c304f2',
        columns: ['categoryId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectCollaborator',
        foreignKey: {
          name: 'ProjectCollaborator_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectCollaborator',
        foreignKey: {
          name: 'ProjectCollaborator_collaboratorId_fkey',
          columns: ['collaboratorId'],
          references: { schema: 'public', table: 'Collaborator', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectImage',
        foreignKey: {
          name: 'ProjectImage_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectSkill',
        foreignKey: {
          name: 'ProjectSkill_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectSkill',
        foreignKey: {
          name: 'ProjectSkill_skillId_fkey',
          columns: ['skillId'],
          references: { schema: 'public', table: 'Skill', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Skill',
        foreignKey: {
          name: 'Skill_categoryId_fkey',
          columns: ['categoryId'],
          references: { schema: 'public', table: 'SkillCategory', columns: ['id'] },
          onDelete: 'restrict',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
