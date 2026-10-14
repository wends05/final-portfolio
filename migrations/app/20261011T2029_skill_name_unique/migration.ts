#!/usr/bin/env -S bun
import type { Contract as Start } from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract';
import startContract from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/e7f60d2935fcdad0ee76a8e73fd0a613817bd610cdab40dcc80178815511c04b/contract';
import endContract from '../../snapshots/e7f60d2935fcdad0ee76a8e73fd0a613817bd610cdab40dcc80178815511c04b/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({ schema: 'public', table: 'Skill', constraint: 'Skill_slug_key' }),
      this.dropColumn({ schema: 'public', table: 'Skill', column: 'slug' }),
      this.createIndex({
        schema: 'public',
        table: 'Skill',
        index: 'skill_name_lower_79c07e41',
        expression: 'lower("name")',
        extras: { unique: true },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
