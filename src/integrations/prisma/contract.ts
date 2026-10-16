import {
	defineContract,
	enumType,
	member,
	now,
} from "@prisma/orm-postgres/contract-builder";

const ProjectStatus = enumType(
	"ProjectStatus",
	{ codecId: "pg/text@1", nativeType: "text" },
	member("Ongoing", "ONGOING"),
	member("Completed", "COMPLETED"),
);

// Calendar date (no time), surfaced as a YYYY-MM-DD string
const dateColumn = { codecId: "pg/date-string@1", nativeType: "date" } as const;

const timestamptzColumn = {
	codecId: "pg/timestamptz-string@1",
	nativeType: "timestamptz",
} as const;

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
				// Set by the database (DEFAULT now()), so rows inserted outside the app get it too
				createdAt: field.column(timestamptzColumn).default(now()),
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

		const Skill = model("Skill", {
			fields: {
				id: field.id.uuidv7Native(),
				slug: field.text().unique(),
				name: field.text(),
				overview: field.text(),
				// 0-100, validated by the admin form
				confidence: field.int().optional(),
				// null = not a top skill; 1..n sets homepage order
				topRank: field.int().optional().unique(),
				// Set by the database (DEFAULT now()), so rows inserted outside the app get it too
				createdAt: field.column(timestamptzColumn).default(now()),
				updatedAt: field.temporal.updatedAtString(),
			},
		});

		const Tool = model("Tool", {
			fields: {
				id: field.id.uuidv7Native(),
				name: field.text(),
				// Set by the database (DEFAULT now()), so rows inserted outside the app get it too
				createdAt: field.column(timestamptzColumn).default(now()),
			},
		}).sql(({ cols, constraints }) => ({
			indexes: [
				// Names are unique ignoring case: "React" and "react" are one tool
				constraints.index({
					expression: {
						fields: [cols.name],
						render: ([name]) => `lower("${name?.name}")`,
					},
					unique: true,
					name: "tool_name_lower",
				}),
			],
		}));

		// A tool can belong to several skills (React under Web and Mobile), or none
		const SkillTool = model("SkillTool", {
			fields: {
				skillId: field.uuidNative(),
				toolId: field.uuidNative(),
			},
		}).attributes(({ fields, constraints }) => ({
			id: constraints.id([fields.skillId, fields.toolId]),
		}));

		const ProjectTool = model("ProjectTool", {
			fields: {
				projectId: field.uuidNative(),
				toolId: field.uuidNative(),
			},
		}).attributes(({ fields, constraints }) => ({
			id: constraints.id([fields.projectId, fields.toolId]),
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
					tools: rel.manyToMany(Tool, {
						through: ProjectTool,
						from: "projectId",
						to: "toolId",
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
				Skill: Skill.relations({
					tools: rel.manyToMany(Tool, {
						through: SkillTool,
						from: "skillId",
						to: "toolId",
					}),
				}),
				Tool: Tool.relations({
					skills: rel.manyToMany(Skill, {
						through: SkillTool,
						from: "toolId",
						to: "skillId",
					}),
					projects: rel.manyToMany(Project, {
						through: ProjectTool,
						from: "toolId",
						to: "projectId",
					}),
				}),
				SkillTool: SkillTool.relations({
					skill: rel
						.belongsTo(Skill, { from: "skillId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
					tool: rel
						.belongsTo(Tool, { from: "toolId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
				}),
				ProjectTool: ProjectTool.relations({
					project: rel
						.belongsTo(Project, { from: "projectId", to: "id" })
						.sql({ fk: { onDelete: "cascade" } }),
					tool: rel
						.belongsTo(Tool, { from: "toolId", to: "id" })
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
