const ex1 = require("./examples/1.json");
const ex2 = require("./examples/2.json");
const ex3 = require("./examples/3.json");
const ex4 = require("./examples/4.json");
const { Configuration, OpenAIApi } = require("openai");
const jotform = require("jotform");
jotform.options({
    debug: true,
    apiKey: process.env.JOTFORM_API_KEY,
});

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function formatExamples() {
  const examples = [
    ex1,
    ex2,
    ex3,
    ex4,
  ];
  let index = 1;

  return examples.map(ex => {
    const currentIndex = index++;
    return `
Example ${currentIndex} input json:
\`\`\`
${JSON.stringify(ex.input)}
\`\`\`

Example ${currentIndex} output json:
\`\`\`
${JSON.stringify(ex.output, undefined, 2)}
\`\`\`
`;
  })
}
async function openaiChatCompletion(content) {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    messages: [
      {
        role: "system",
        content: `There exists a form for the public to submit place of interest along with relevant metadata.
Your job is to determine if the submission is a spam,
the confidence level on whether it is a spam or not (scale of 0.0 to 1.0),
and the transformed json document.
You should respond in valid json format only and nothing more.
You should respond with data field set to empty array if the input is likely to be spam.
You should not add additional fields and only include the fields defined in the example and an additional the field named \`confidence\` for confidence level.

${formatExamples()}

Reminder: You should respond in valid json format only and nothing more.
Let's begin.
`,
      },
      {
        role: "user",
        content,
      }
    ],
  });

  return completion;
}

async function getUnreadSubmissions() {
  const submissions = await jotform.getFormSubmissions(
    82582716945468,
    { filter: { new: '1' } },
  );
  // console.log(submissions);
  // .then((result) => console.log(result))
  // .catch(console.error);

  return submissions;
}

async function main() {
  const submissions = await getUnreadSubmissions();
  const item0 = Object.values(submissions[17].answers)
    .filter(it => it.answer && it.name !== "yourEmail");
  console.log(JSON.stringify(item0, undefined, 2));

  let attempt = 0;
  while (attempt++ < 3) {
    try {
      const result = await openaiChatCompletion(JSON.stringify([item0]));
      const resultExtracted = JSON.parse(result.data.choices?.[0]?.message?.content);
      console.log(JSON.stringify(resultExtracted, undefined, 2));
      break;
    } catch (e) {
      console.warn(e);
    }
  }
}

main();

// 1. get form submissions (unread) (/)
// 2. convert submission to expected json if not spam (/)
// 2b. Enhance prompt to ensure all fields are mapped (/)
// 2c. Enhance examples to exclude mosques and masjid
// 3. Run tool in pipeline
// 4. Create an entry in the main data and generate relevant files
// 5. Commit and Push
// 6. Mark data in jotform as read
// 7. check for duplicates (embedding)
