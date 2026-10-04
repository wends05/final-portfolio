import {
	defineContract,
	enumType,
	member,
} from "@prisma/orm-postgres/contract-builder";

const ProjectStatus = enumType(
	"ProjectStatus",
	{ codecId: "pg/text@1", nativeType: "text" },
	member("Ongoing", "ONGOING"),
	member("Completed", "COMPLETED"),
);

// Calendar date (no time), surfaced as a YYYY-MM-DD string
const dateColumn = { codecId: "pg/date-string@1", nativeType: "date" } as const;

export const contract = defineContract(
	{ enums: { ProjectStatus } },
	({ field, model, rel }) => {
		const Project = model("Project", {
			fields: {
				id: field.id.uuidv7Native(),
				slug: field.text().unique(),
				title: field.text(),
				description: field.text(),
				coverImageKey: field.text().optional(),
				githubUrl: field.text().optional(),
				liveUrl: field.text().optional(),
				status: field.namedType(ProjectStatus).default("ONGOING"),
				// null = not featured; 1..n sets homepage order
				featuredRank: field.int().optional().unique(),
				published: field.boolean().default(false),
				teamName: field.text().optional(),
				// Free-form extras until a key earns its own column
				metadata: field.json().defaultSql("'{}'::jsonb"),
				startedAt: field.column(dateColumn).optional(),
				endedAt: field.column(dateColumn).optional(),
				createdAt: field.temporal.createdAtString(),
				updatedAt: field.temporal.updatedAtString(),
			},
		});

		const ProjectImage = model("ProjectImage", {
			fields: {
				id: field.id.uuidv7Native(),
				projectId: field.uuidNative(),
				// Storage bucket key, not a full URL
				key: field.text(),
				alt: field.text(),
				order: field.int().default(0),
			},
		});

		const SkillCategory = model("SkillCategory", {
			fields: {
				id: field.id.uuidv7Native(),
				slug: field.text().unique(),
				name: field.text(),
				overview: field.text(),
				// 0-100, validated by the admin form
				confidence: field.int().optional(),
				// null = not a top skill; 1..n sets homepage order
				topRank: field.int().optional().unique(),
				createdAt: field.temporal.createdAtString(),
				updatedAt: field.temporal.updatedAtString(),
			},
		});

		const Skill = model("Skill", {
			fields: {
				id: field.id.uuidv7Native(),
				categoryId: field.uuidNative(),
				slug: field.text().unique(),
				name: field.text(),
				createdAt: field.temporal.createdAtString(),
			},
		});

		const ProjectSkill = model("ProjectSkill", {
			fields: {
				projectId: field.uuidNative(),
				skillId: field.uuidNative(),
			},
		}).attributes(({ fields, constraints }) => ({
			id: constraints.id([fields.projectId, fields.skillId]),
		}));

		const Collaborator = model("Collaborator", {
			fields: {
				id: field.id.uuidv7Native(),
				name: field.text(),
				profileUrl: field.text().optional(),
			},
		});

		const ProjectCollaborator = model("ProjectCollaborator", {
			fields: {
				projectId: field.uuidNative(),
				collaboratorId: field.uuidNative(),
				role: field.text().optional(),
			},
		}).attributes(({ fields, constraints }) => ({
			id: constraints.id([fields.projectId, fields.collaboratorId]),
		}));

		return {
			models: {
				Project: Project.relations({
					images: rel.hasMany(ProjectImage, { by: "projectId" }),
					skills: rel.manyToMany(Skill, {
						through: ProjectSkill,
						from: "projectId",
						to: "skillId",
					}),
					collaborators: rel.hasMany(ProjectCollaborator, {
						by: "projectId",
					}),
				}),
				ProjectImage: ProjectImage.relations({
					project: rel
						.belongsTo(Project, { from: "projectId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
				}),
				SkillCategory: SkillCategory.relations({
					skills: rel.hasMany(Skill, { by: "categoryId" }),
				}),
				Skill: Skill.relations({
					category: rel
						.belongsTo(SkillCategory, { from: "categoryId", to: "id" })
						.sql({ fk: { onDelete: "restrict" } }),
					projects: rel.manyToMany(Project, {
						through: ProjectSkill,
						from: "skillId",
						to: "projectId",
					}),
				}),
				ProjectSkill: ProjectSkill.relations({
					project: rel
						.belongsTo(Project, { from: "projectId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
					skill: rel
						.belongsTo(Skill, { from: "skillId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
				}),
				Collaborator: Collaborator.relations({
					projects: rel.hasMany(ProjectCollaborator, {
						by: "collaboratorId",
					}),
				}),
				ProjectCollaborator: ProjectCollaborator.relations({
					project: rel
						.belongsTo(Project, { from: "projectId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
					collaborator: rel
						.belongsTo(Collaborator, { from: "collaboratorId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
				}),
			},
		};
	},
);
