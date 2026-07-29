import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { connectDB, disconnectDB } from '../config/database.js';
import { Topic } from '../models/Topic.model.js';
import SubTopic from '../models/SubTopic.model.js';
import Question from '../models/Question.model.js';

const seedData = async () => {
    try {
        const connected = await connectDB();
        if (!connected) return;

        console.log('🧹 Clearing existing data...');
        await Question.deleteMany({});
        await SubTopic.deleteMany({});
        await Topic.deleteMany({});

        const filePath = path.join(process.cwd(), '..', 'sheet.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const { data } = JSON.parse(fileContent);
        const { questions } = data;

        console.log(`📦 Processing ${questions.length} questions...`);

        const topicsMap = new Map();

        // Group questions by Topic and Sub-Topic
        for (const q of questions) {
            const topicTitle = q.topic || 'General';
            const subTopicTitle = q.subTopic || 'Miscellaneous';

            if (!topicsMap.has(topicTitle)) {
                topicsMap.set(topicTitle, new Map());
            }

            const subTopicsMap = topicsMap.get(topicTitle);
            if (!subTopicsMap.has(subTopicTitle)) {
                subTopicsMap.set(subTopicTitle, []);
            }

            subTopicsMap.get(subTopicTitle).push(q);
        }

        let topicOrder = 1;
        for (const [topicTitle, subTopicsMap] of topicsMap) {
            console.log(`🔹 Creating Topic: ${topicTitle}`);

            const topic = await Topic.create({
                title: topicTitle,
                order: topicOrder++,
                description: `Questions for ${topicTitle}`
            });

            let subTopicOrder = 1;
            for (const [subTopicTitle, qList] of subTopicsMap) {
                console.log(`  🔸 Creating Sub-Topic: ${subTopicTitle}`);

                const subTopic = await SubTopic.create({
                    title: subTopicTitle,
                    order: subTopicOrder++
                });

                let questionOrder = 1;
                const questionIds = [];
                const ALLOWED_PLATFORMS = ['leetcode', 'geeksforgeeks', 'codestudio', 'hackerrank', 'codechef', 'interviewbit', 'ninjas', 'other'];

                for (const qData of qList) {
                    const rawPlatform = qData.questionId?.platform;
                    const platform = ALLOWED_PLATFORMS.includes(rawPlatform) ? rawPlatform : 'other';

                    const question = await Question.create({
                        title: qData.title || qData.questionId?.name || 'Untitled Question',
                        isSolved: false,
                        difficulty: qData.questionId?.difficulty || 'Medium',
                        order: questionOrder++,
                        problemUrl: qData.questionId?.problemUrl || '#',
                        platform: platform,
                        resource: qData.resource || '#',
                        companyTags: qData.questionId?.companyTags || []
                    });
                    questionIds.push(question._id);
                }

                subTopic.questions = questionIds;
                await subTopic.save();

                topic.subTopics.push(subTopic._id);
            }

            await topic.save();
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        await disconnectDB();
    }
};

seedData();
