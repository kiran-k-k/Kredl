#!/bin/bash
FILE="src/modules/progress/progress.service.ts"
# Remove getContinueLearning, getProgressSummary, getCourseProgressDetails, recalculatePercentage, calculateModuleAccess
sed -i '' -e '/async recalculatePercentage/,/^  }/d' $FILE
sed -i '' -e '/async calculateModuleAccess/,/^  }/d' $FILE
sed -i '' -e '/async getContinueLearning/,/^  }/d' $FILE
sed -i '' -e '/async getProgressSummary/,/^  }/d' $FILE
sed -i '' -e '/async getCourseProgressDetails/,/^  }/d' $FILE
