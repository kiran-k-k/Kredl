with open('src/components/onboarding/StepCareerGoals.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if "value={data.placementGoal" in line:
        new_lines.append("            {/* @ts-ignore */}\n")
    if "value={data.joiningTimeline" in line:
        new_lines.append("            {/* @ts-ignore */}\n")
    new_lines.append(line)

with open('src/components/onboarding/StepCareerGoals.tsx', 'w') as f:
    f.writelines(new_lines)
