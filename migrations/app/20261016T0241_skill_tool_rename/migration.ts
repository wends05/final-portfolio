#!/usr/bin/env -S bun
import type { Contract as End } from '../../snapshots/7540d8dd263ef54a97cfbdaa107ec57040e003ff0f248b3c0548f039e5a9e9fb/contract';
import endContract from '../../snapshots/7540d8dd263ef54a97cfbdaa107ec57040e003ff0f248b3c0548f039e5a9e9fb/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/e7f60d2935fcdad0ee76a8e73fd0a613817bd610cdab40dcc80178815511c04b/contract';
import startContract from '../../snapshots/e7f60d2935fcdad0ee76a8e73fd0a613817bd610cdab40dcc80178815511c04b/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  col,
  fn,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropTable({ schema: 'public', table: 'ProjectSkill' }),
      // The old Skill table (a technology) becomes Tool and SkillCategory becomes
      // Skill. Every table involved was empty when this was planned, so Skill is
      // dropped and created again instead of being altered in place.
      this.dropTable({ schema: 'public', table: 'Skill' }),
      this.dropTable({ schema: 'public', table: 'SkillCategory' }),
      this.createTable({
        schema: 'public',
        table: 'ProjectTool',
        columns: [
          col('projectId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('toolId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['projectId', 'toolId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'SkillTool',
        columns: [
          col('skillId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('toolId', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
        ],
        constraints: [primaryKey(['skillId', 'toolId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Tool',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'uuid', { notNull: true, codecRef: { codecId: 'pg/uuid@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'Skill',
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
        table: 'Skill',
        constraint: 'Skill_slug_key',
        columns: ['slug'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Skill',
        constraint: 'Skill_topRank_key',
        columns: ['topRank'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectTool',
        index: 'ProjectTool_projectId_idx_a96e4d92',
        columns: ['projectId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'ProjectTool',
        index: 'ProjectTool_toolId_idx_f1fb6638',
        columns: ['toolId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SkillTool',
        index: 'SkillTool_skillId_idx_6e19993d',
        columns: ['skillId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'SkillTool',
        index: 'SkillTool_toolId_idx_f1fb6638',
        columns: ['toolId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Tool',
        index: 'tool_name_lower_79c07e41',
        expression: 'lower("name")',
        extras: { unique: true },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectTool',
        foreignKey: {
          name: 'ProjectTool_projectId_fkey',
          columns: ['projectId'],
          references: { schema: 'public', table: 'Project', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'ProjectTool',
        foreignKey: {
          name: 'ProjectTool_toolId_fkey',
          columns: ['toolId'],
          references: { schema: 'public', table: 'Tool', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SkillTool',
        foreignKey: {
          name: 'SkillTool_skillId_fkey',
          columns: ['skillId'],
          references: { schema: 'public', table: 'Skill', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'SkillTool',
        foreignKey: {
          name: 'SkillTool_toolId_fkey',
          columns: ['toolId'],
          references: { schema: 'public', table: 'Tool', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
