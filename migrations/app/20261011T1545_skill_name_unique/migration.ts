#!/usr/bin/env -S bun
import type { Contract as Start } from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract';
import startContract from '../../snapshots/74a37888cba2bef093df97db7709beb11216c9bcb4f48d58dd71e1d22d8a8ec5/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/df8db59c2b681469b18814a17a0b0e025778f39573b97d56aba0345c528db22e/contract';
import endContract from '../../snapshots/df8db59c2b681469b18814a17a0b0e025778f39573b97d56aba0345c528db22e/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropDefault({ schema: 'public', table: 'Project', column: 'createdAt' }),
      this.dropDefault({ schema: 'public', table: 'Skill', column: 'createdAt' }),
      this.dropConstraint({ schema: 'public', table: 'Skill', constraint: 'Skill_slug_key' }),
      this.dropColumn({ schema: 'public', table: 'Skill', column: 'slug' }),
      this.dropDefault({ schema: 'public', table: 'SkillCategory', column: 'createdAt' }),
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
