import { SCENARIOS, getScenario } from './scenarios';
import { Scenario } from './types';

export class ContextEngine {
    private currentScenario: Scenario;

    constructor(initialScenarioId: string = 'general') {
        this.currentScenario = getScenario(initialScenarioId);
    }

    public switchTo(scenarioId: string): Scenario {
        this.currentScenario = getScenario(scenarioId);
        return this.currentScenario;
    }

    public getCurrentScenario(): Scenario {
        return this.currentScenario;
    }

    public getAllScenarios(): Scenario[] {
        return Object.values(SCENARIOS);
    }
}

export const contextEngine = new ContextEngine();
