import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/database.js';

const ALLOWED_PLATFORMS = ['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other'] as const;

const seedData = async () => {
    try {
        await prisma.$connect();

        console.log('🧹 Clearing existing data...');
        await prisma.question.deleteMany({});
        await prisma.subTopic.deleteMany({});
        await prisma.topic.deleteMany({});

        const filePath = path.join(process.cwd(), '..', 'sheet.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = JSON.parse(fileContent);
        const { questions } = data;

        console.log(`📦 Processing ${questions.length} questions...`);

        // We need a seed user — use the first user in the DB, or skip if none exists
        const seedUser = await prisma.user.findFirst();
        if (!seedUser) {
            console.warn('⚠️  No users found in the database. Create a user first, then re-run the seed.');
            return;
        }

        const topicsMap = new Map<string, Map<string, any[]>>();

        // Group questions by Topic and Sub-Topic
        for (const q of questions) {
            const topicTitle: string = q.topic || 'General';
            const subTopicTitle: string = q.subTopic || 'Miscellaneous';

            if (!topicsMap.has(topicTitle)) {
                topicsMap.set(topicTitle, new Map());
            }

            const subTopicsMap = topicsMap.get(topicTitle)!;
            if (!subTopicsMap.has(subTopicTitle)) {
                subTopicsMap.set(subTopicTitle, []);
            }

            subTopicsMap.get(subTopicTitle)!.push(q);
        }

        let topicOrder = 1;
        for (const [topicTitle, subTopicsMap] of topicsMap) {
            console.log(`🔹 Creating Topic: ${topicTitle}`);

            const topic = await prisma.topic.create({
                data: {
                    title: topicTitle,
                    order: topicOrder++,
                    description: `Questions for ${topicTitle}`,
                    userId: seedUser.id,
                },
            });

            let subTopicOrder = 1;
            for (const [subTopicTitle, qList] of subTopicsMap) {
                console.log(`  🔸 Creating Sub-Topic: ${subTopicTitle}`);

                const subTopic = await prisma.subTopic.create({
                    data: {
                        title: subTopicTitle,
                        order: subTopicOrder++,
                        topicId: topic.id,
                    },
                });

                let questionOrder = 1;
                for (const qData of qList) {
                    const rawPlatform = qData.questionId?.platform;
                    const platform = ALLOWED_PLATFORMS.includes(rawPlatform) ? rawPlatform : 'other';

                    await prisma.question.create({
                        data: {
                            title: qData.title || qData.questionId?.name || 'Untitled Question',
                            isSolved: false,
                            difficulty: qData.questionId?.difficulty || 'Medium',
                            order: questionOrder++,
                            problemUrl: qData.questionId?.problemUrl || '#',
                            platform,
                            resource: qData.resource || '#',
                            companyTags: qData.questionId?.companyTags || [],
                            topicId: topic.id,
                            subTopicId: subTopic.id,
                        },
                    });
                }
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await prisma.$disconnect();
    }
};

seedData();
