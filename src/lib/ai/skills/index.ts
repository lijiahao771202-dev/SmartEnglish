import { SkillRegistry } from './registry';
import { EtymologySkill } from './definitions/EtymologySkill';
import { VisualAidSkill } from './definitions/VisualAidSkill';
import { ShowCardSkill } from './definitions/ShowCardSkill';
import { GenerateExampleSkill } from './definitions/GenerateExampleSkill';
import { StartRoleplaySkill } from './definitions/StartRoleplaySkill';
import { NextWordSkill } from './definitions/NextWordSkill';

// Register all skills
export function initSkills() {
    SkillRegistry.register(EtymologySkill);
    SkillRegistry.register(VisualAidSkill);
    SkillRegistry.register(ShowCardSkill);
    SkillRegistry.register(GenerateExampleSkill);
    SkillRegistry.register(StartRoleplaySkill);
    SkillRegistry.register(NextWordSkill);
}

// Auto-init on import
initSkills();

export { SkillRegistry };
