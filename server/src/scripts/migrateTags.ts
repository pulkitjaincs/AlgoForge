import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting tag migration...');
  
  const questions = await prisma.question.findMany({
    where: {
      companyTags: {
        isEmpty: false,
      },
    },
  });

  console.log(`Found ${questions.length} questions with tags.`);

  for (const question of questions) {
    for (const tagName of question.companyTags) {
      // Find or create the tag
      let tag = await prisma.tag.findUnique({
        where: { name: tagName },
      });

      if (!tag) {
        tag = await prisma.tag.create({
          data: {
            name: tagName,
            category: 'company',
          },
        });
        console.log(`Created new tag: ${tagName}`);
      }

      // Create the QuestionTag link if it doesn't exist
      const existingLink = await prisma.questionTag.findUnique({
        where: {
          questionId_tagId: {
            questionId: question.id,
            tagId: tag.id,
          },
        },
      });

      if (!existingLink) {
        await prisma.questionTag.create({
          data: {
            questionId: question.id,
            tagId: tag.id,
          },
        });
        console.log(`Linked tag ${tagName} to question ${question.title}`);
      }
    }
  }

  console.log('Tag migration complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
