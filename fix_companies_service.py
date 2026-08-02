with open('backend/src/modules/companies/companies.service.ts', 'r') as f:
    content = f.read()

content = content.replace("import { UpdateCompanyDto } from './dto/update-company.dto';", "import { UpdateCompanyDto } from './dto/update-company.dto';\nimport slugify from 'slugify';")

# Add slug generation
create_pattern = """  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const escapedName = createCompanyDto.name"""

create_replacement = """  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const escapedName = createCompanyDto.name"""

content = content.replace("const company = new this.companyModel(createCompanyDto);", "const slug = slugify(createCompanyDto.name, { lower: true, strict: true });\n      const company = new this.companyModel({ ...createCompanyDto, slug });")

# Add populate to findOne
content = content.replace("const company = await this.companyModel.findById(id).exec();", "const company = await this.companyModel.findById(id).populate('relatedJobRoles').populate('jobOpenings').exec();")

with open('backend/src/modules/companies/companies.service.ts', 'w') as f:
    f.write(content)
