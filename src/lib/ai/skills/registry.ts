import { Skill, SkillContext } from './types';

class Registry {
    private skills: Map<string, Skill> = new Map();

    register(skill: Skill) {
        if (this.skills.has(skill.name)) {
            console.warn(`Skill ${skill.name} is already registered. Overwriting.`);
        }
        this.skills.set(skill.name, skill);
    }

    get(name: string): Skill | undefined {
        return this.skills.get(name);
    }

    getAllTools() {
        return Array.from(this.skills.values()).map(skill => ({
            type: "function" as const,
            function: {
                name: skill.name,
                description: skill.description,
                parameters: skill.parameters
            }
        }));
    }

    async execute(name: string, args: any, context: SkillContext) {
        const skill = this.get(name);
        if (!skill) {
            throw new Error(`Skill ${name} not found`);
        }
        await skill.execute(args, context);
    }
}

export const SkillRegistry = new Registry();
