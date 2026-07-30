-- CreateIndex
CREATE INDEX "Question_topicId_order_idx" ON "Question"("topicId", "order");

-- CreateIndex
CREATE INDEX "Question_subTopicId_order_idx" ON "Question"("subTopicId", "order");

-- CreateIndex
CREATE INDEX "SubTopic_topicId_order_idx" ON "SubTopic"("topicId", "order");

-- CreateIndex
CREATE INDEX "Topic_userId_order_idx" ON "Topic"("userId", "order");
