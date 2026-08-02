import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';

function checkUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        console.error(`❌ Bad URL [${res.statusCode}]: ${url}`);
        resolve(false);
      }
    }).on('error', (e) => {
      console.error(`❌ Error fetching ${url}: ${e.message}`);
      resolve(false);
    });
  });
}

async function validateCourseData(courseDir: string) {
  console.log(`Starting validation for: ${courseDir}`);
  let allValid = true;

  // Validate Lessons (YouTube URLs)
  const lessonsPath = path.join(courseDir, 'lessons', 'm01-lessons.json');
  if (fs.existsSync(lessonsPath)) {
    const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));
    for (const lesson of lessons) {
      for (const yt of lesson.youtubeUrls) {
        console.log(`Checking YouTube: ${yt.url}`);
        const isValid = await checkUrl(yt.url);
        if (!isValid) allValid = false;
      }
    }
  }

  // Validate Projects (GitHub URLs)
  const projectsPath = path.join(courseDir, 'projects', 'm01-projects.json');
  if (fs.existsSync(projectsPath)) {
    const projects = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
    for (const project of projects) {
      if (project.githubUrl) {
        console.log(`Checking GitHub: ${project.githubUrl}`);
        const isValid = await checkUrl(project.githubUrl);
        if (!isValid) allValid = false;
      }
    }
  }

  if (allValid) {
    console.log('✅ All URLs validated successfully!');
  } else {
    console.error('❌ Some URLs failed validation. Please review them.');
    process.exit(1);
  }
}

const dir = path.join(__dirname, 'data', 'java-full-stack');
validateCourseData(dir);
