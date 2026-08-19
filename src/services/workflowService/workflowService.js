const wait = (ms = 650) => new Promise((resolve) => setTimeout(resolve, ms));

export async function processStep({ scenarioId, stepId, inputs }) {
  await wait(700);
  return {
    status: "success",
    scenarioId,
    stepId,
    inputs,
    message: "Step completed successfully."
  };
}
