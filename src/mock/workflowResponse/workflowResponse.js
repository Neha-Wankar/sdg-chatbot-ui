export async function mockProcessStep({ scenarioId, stepId, inputs }) {
  await new Promise((resolve) => setTimeout(resolve, 150));
  return {
    status: "success",
    scenarioId,
    stepId,
    inputs,
    message: "Step completed successfully.",
  };
}
