with open('src/components/onboarding/StepCareerGoals.tsx', 'r') as f:
    content = f.read()

content = content.replace("value={data.placementGoal}", "value={data.placementGoal || undefined}")
content = content.replace("value={data.joiningTimeline}", "value={data.joiningTimeline || undefined}")

with open('src/components/onboarding/StepCareerGoals.tsx', 'w') as f:
    f.write(content)
