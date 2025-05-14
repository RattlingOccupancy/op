


const { Rettiwt } = require('rettiwt-api');
const fs = require('fs');
const path = require('path');
const francModule = require('franc');
const franc = francModule.franc;

const rettiwt = new Rettiwt({
    apiKey: "a2R0PUZZbmViR2hJZU8ydHFEUVJSYkdCM0xiOWdKUE9sVTBxQWNoQ2NGaEU7YXV0aF90b2tlbj03NzUxN2FkYzQzMGY0NTUxYWI5YmRlNWI2ZjNhOTRhZTc2YWRhZjlhO2N0MD05ZjQzZjkxOTQ4NGRhNGYwNGNkZjIyYTE4NmZiYjdjMjIzM2Q4YmIxMjRjNjk0ZjU4OGZiODNhYzc0OGUzYjA3YzVkNWJlODkzZjBkNzVkYzNmMTQ3ZmI2MjI0MmRkMjc1ZTBiY2ZkYWE3MzU0MjIyN2Q5MDdmNDI5Y2QyODUyNGI4MmU4NjI4ZmM1NTczYzcwYjA0MTQxN2M4ZmFhOTU0O3R3aWQ9dSUzRDE2NzE0MzAzMDg4NzE0MDU1Njg7==", // Replace with your valid Rettiwt API key
    logging: true
});

async function fetchTweets(topic, totalCount) {
    if (!topic) {
        console.error('❌ Topic is required as a command-line argument');
        process.exit(1);
    }

    console.log(`🚀 Starting fetch for '${topic}'...`);

const outputPath = path.join(__dirname, '..', 'tweets.json');
    const allTweets = [];
    const tweetTexts = new Set();

    const filters = [
        { keywords: [topic] },
        { hashtags: [topic.replace('#', '')] }
    ];

    for (const filter of filters) {
        let max_id = undefined;

        while (allTweets.length < totalCount) {
            const remaining = totalCount - allTweets.length;
            const batchSize = Math.min(50, remaining);

            const query = {
                ...filter,
                maxResults: batchSize
            };

            // ✅ Add pagination control
            if (max_id) query.untilId = max_id;

            const tweets = await rettiwt.tweet.search(query);
            if (!tweets || !tweets.list || tweets.list.length === 0) break;

            let newTweetsAdded = false;

            for (const t of tweets.list) {
                const text = t.fullText || '';
                if (franc(text) === 'eng' && !tweetTexts.has(text)) {
                    tweetTexts.add(text);
                    allTweets.push({ text });
                    newTweetsAdded = true;
                }

                if (allTweets.length >= totalCount) break;
            }

            console.log(`🔁 Fetched ${allTweets.length}/${totalCount} unique English tweets so far...`);

            // ⛔ Stop if no new unique tweets were added to avoid infinite loop
            if (!newTweetsAdded) break;

            // 🔄 Set max_id to last tweet's ID for pagination
            max_id = tweets.list[tweets.list.length - 1].id_str;

            await new Promise(resolve => setTimeout(resolve, 3000)); // Throttle
        }

        if (allTweets.length >= totalCount) break;
    }

    if (allTweets.length > 0) {
        fs.writeFileSync(outputPath, JSON.stringify({
            success: true,
            tweets: allTweets.slice(0, totalCount)
        }, null, 2));
        console.log(`✅ Successfully fetched ${allTweets.length} unique English tweets`);
    } else {
        console.error('❌ No English tweets found for the topic');
        process.exit(1);
    }
}

const [topic] = process.argv.slice(2);
const count = 10;

fetchTweets(topic, count);
