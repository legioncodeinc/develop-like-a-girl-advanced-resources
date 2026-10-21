// Pure view helper. These facts must come from owner-scoped persisted server queries.
export function activationProgress(facts) {
  const steps = [
    { id: 'profile', label: 'Add your profile', complete: facts.profileSaved === true },
    { id: 'record', label: 'Create your first record', complete: facts.recordCount > 0 }
  ];
  return { steps, completed: steps.filter(step => step.complete).length, total: steps.length };
}
