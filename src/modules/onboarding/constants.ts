import type { PersonalityTraits, UserGoal } from '@/types';

/**
 * Default personality traits used when onboarding is skipped
 * or AI analysis fails. These are also used to detect if a profile
 * contains placeholder values.
 */
export const DEFAULT_PERSONALITY_TRAITS: PersonalityTraits = {
    openness: 70,
    conscientiousness: 70,
    extraversion: 50,
    agreeableness: 70,
    neuroticism: 40,
    analyticalThinking: 70,
    creativity: 60,
    ambition: 75,
};

/**
 * Default goal used when onboarding is skipped
 */
export const DEFAULT_GOAL_DESCRIPTION = 'General self-improvement';

/**
 * Default challenge used when onboarding is skipped
 */
export const DEFAULT_CHALLENGE = 'Finding time to read';

/**
 * Check if personality traits match the default placeholder values
 */
export function isPlaceholderPersonality(personality: PersonalityTraits): boolean {
    return (
        personality.openness === DEFAULT_PERSONALITY_TRAITS.openness &&
        personality.conscientiousness === DEFAULT_PERSONALITY_TRAITS.conscientiousness &&
        personality.extraversion === DEFAULT_PERSONALITY_TRAITS.extraversion &&
        personality.agreeableness === DEFAULT_PERSONALITY_TRAITS.agreeableness &&
        personality.neuroticism === DEFAULT_PERSONALITY_TRAITS.neuroticism &&
        personality.analyticalThinking === DEFAULT_PERSONALITY_TRAITS.analyticalThinking &&
        personality.creativity === DEFAULT_PERSONALITY_TRAITS.creativity &&
        personality.ambition === DEFAULT_PERSONALITY_TRAITS.ambition
    );
}

/**
 * Check if goals contain only the default placeholder
 */
export function isPlaceholderGoals(goals: UserGoal[]): boolean {
    return goals.length === 1 && goals[0].description === DEFAULT_GOAL_DESCRIPTION;
}

/**
 * Check if challenges contain only the default placeholder
 */
export function isPlaceholderChallenges(challenges: string[]): boolean {
    return challenges.length === 1 && challenges[0] === DEFAULT_CHALLENGE;
}

/**
 * Check if the entire profile appears to be placeholder data
 */
export function isPlaceholderProfile(profile: {
    personality: PersonalityTraits;
    goals: UserGoal[];
    challenges: string[];
}): boolean {
    return (
        isPlaceholderPersonality(profile.personality) &&
        isPlaceholderGoals(profile.goals) &&
        isPlaceholderChallenges(profile.challenges)
    );
}
