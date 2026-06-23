import { runAudit } from "./ai/insights";

const url = process.argv[2];

if (!url) {
    console.log("Please provide a URL");
    console.log("Example: npx ts-node src/cli.ts https://example.com");
    process.exit(1);
}

async function main() {
    console.log("Running audit for:", url);

    const result = await runAudit(url);

    console.log("\n RESULT:\n");
    console.log(JSON.stringify(result, null, 2));
}

main();