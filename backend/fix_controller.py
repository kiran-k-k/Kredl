import re

# Update module
with open('src/modules/progress/progress.module.ts', 'r') as f:
    mod_content = f.read()

if "DashboardModule" not in mod_content:
    mod_content = mod_content.replace(
        "import { QuizModule } from '../quiz/quiz.module';",
        "import { QuizModule } from '../quiz/quiz.module';\nimport { DashboardModule } from '../dashboard/dashboard.module';"
    )
    mod_content = mod_content.replace(
        "forwardRef(() => QuizModule),",
        "forwardRef(() => QuizModule),\n    forwardRef(() => DashboardModule),"
    )
    with open('src/modules/progress/progress.module.ts', 'w') as f:
        f.write(mod_content)

# Update DashboardModule to export DashboardService
with open('src/modules/dashboard/dashboard.module.ts', 'r') as f:
    dash_mod_content = f.read()

if "exports: [" not in dash_mod_content:
    dash_mod_content = dash_mod_content.replace(
        "  providers: [",
        "  exports: [DashboardService],\n  providers: ["
    )
    with open('src/modules/dashboard/dashboard.module.ts', 'w') as f:
        f.write(dash_mod_content)

# Update controller
with open('src/modules/progress/progress.controller.ts', 'r') as f:
    ctrl_content = f.read()

if "DashboardService" not in ctrl_content:
    ctrl_content = ctrl_content.replace(
        "import { ProgressService } from './progress.service';",
        "import { ProgressService } from './progress.service';\nimport { DashboardService } from '../dashboard/dashboard.service';"
    )
    
    ctrl_content = ctrl_content.replace(
        "constructor(\n    private readonly progressService: ProgressService,\n  ) {}",
        "constructor(\n    private readonly progressService: ProgressService,\n    @Inject(forwardRef(() => DashboardService)) private readonly dashboardService: DashboardService,\n  ) {}"
    )

    old_cont = r"""  @Get\('continue-learning'\)[\s\S]*?\}"""
    new_cont = """  @Get('continue-learning')
  @Roles(RoleEnum.STUDENT)
  @ApiOperation({ summary: 'Get continue learning data' })
  async getContinueLearning(@CurrentUser() user: { sub: string }) {
    const data = await this.dashboardService.getContinueLearning(user.sub);
    return { success: true, data };
  }"""
    
    ctrl_content = re.sub(old_cont, new_cont, ctrl_content)

    with open('src/modules/progress/progress.controller.ts', 'w') as f:
        f.write(ctrl_content)
