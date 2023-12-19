import express, { Express, Request, Response } from "express";

// Setup supabase
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://pjzqvkpwcsxsnaktfhgc.supabase.co";
// const supabaseKey = process.env.SUPABASE_KEY;
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqenF2a3B3Y3N4c25ha3RmaGdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5MTUyMzgsImV4cCI6MjAxODQ5MTIzOH0.cimz-9KNZf80D5kGDc1aXsoZ61ESRTXas2vV_7ZK7Es";
const supabase = createClient(supabaseUrl, supabaseKey || "");

// Allow CORS
const cors = require("cors");

// Create a new express application
const app: Express = express();

// The port the express app will listen on
const PORT: number = 3000;

// Use the CORS middleware
app.use(cors());

// Use the body-parser middleware to parse incoming request bodies.
// We set a limit of 5mb to handle large payloads that may come with the POST requests.
// This is necessary to prevent potential issues with payload size exceeding the default limit.
app.use(
  express.json({ limit: "5mb" }),
  express.urlencoded({ limit: "5mb", extended: true })
);

function hexToUtf8(hex: string) {
  if (hex.startsWith("0x")) {
    hex = hex.slice(2);
  }
  let str = "";
  for (let i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16));
  }
  return decodeURIComponent(encodeURIComponent(str));
}

function renderHTML(events: any[]): string {
  let html = "<ul>";
  events.forEach((event) => {
    html += `<li>${JSON.stringify(event)}</li>`;
  });
  html += "</ul>";
  return html;
}

app.get("/api/getAllProposal", async (req, res) => {
  const { data, error } = await supabase.from("proposalsubmitted").select();
  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ data });
  }
});

app.post("/api/getAProposal", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const { data, error } = await supabase
    .from("proposalsubmitted")
    .select()
    .eq("proposaltitle", title)
    .eq("proposaldescription", description);

  // const { data, error } = await supabase.from('books').select().textSearch('description', `'big'`);

  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ data });
  }
});

app.post("/api/voteFor", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const updatedNumVoteFor = req.body.updatedNumVoteFor;
  const updatedVoteForHistory = req.body.updatedVoteForHistory;

  const { data, error } = await supabase
    .from("proposalsubmitted")
    .update({
      votefornum: updatedNumVoteFor,
      voteforhistory: updatedVoteForHistory,
    })
    .eq("proposaltitle", title)
    .eq("proposaldescription", description);
  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ data });
  }
});

app.post("/api/voteAgainst", async (req, res) => {
  const title = req.body.title;
  const description = req.body.description;
  const updatedNumVoteAgainst = req.body.updatedNumVoteAgainst;
  const updatedVoteAgainstHistory = req.body.updatedVoteAgainstHistory;

  const { data, error } = await supabase
    .from("proposalsubmitted")
    .update({
      voteagainstnum: updatedNumVoteAgainst,
      voteagainsthistory: updatedVoteAgainstHistory,
    })
    .eq("proposaltitle", title)
    .eq("proposaldescription", description);
  if (error) {
    res.status(400).json({ error });
  } else {
    res.status(200).json({ data });
  }
});

app.post("/api/submitProposal", async (req, res) => {
  const events = req.body;
  // Loop through each item in the apply array
  events.apply.forEach((item: any) => {
    // Loop through each transaction in the item
    item.transactions.forEach((transaction: any) => {
      // If the transaction has operations, loop through them
      if (transaction.operations) {
        transaction.operations.forEach(async (operation: any) => {
          // Log the operation
          console.log({ operation });

          const data = operation; // Parse out the data you want
          console.log(data);

          const { error } = await supabase.from("proposalsubmitted").insert({
            walletid: data.walletId,
            proposaltitle: data.proposalTitle,
            proposaldescription: data.proposalDescription,
            votefornum: data.voteForNum,
            voteagainstnum: data.voteAgainstNum,
            voteforhistory: data.voteForHistory,
            voteagainsthistory: data.voteAgainstHistory,
          });
          console.log({ error });
        });
      }
    });
  });

  // Send a response back to Chainhook to acknowledge receipt of the event
  res.status(200).send({ message: "Proposal Submitted!" });
});

// app.post("/api/events", async (req, res) => {
//   const events = req.body;
//   // Loop through each item in the apply array
//   events.apply.forEach((item: any) => {
//     // Loop through each transaction in the item
//     item.transactions.forEach((transaction: any) => {
//       // If the transaction has operations, loop through them
//       if (transaction.operations) {
//         transaction.operations.forEach(async (operation: any) => {
//           // Log the operation
//           console.log({ operation });

//           const data = operation; // Parse out the data you want
//           // const data = "Test data";
//           // Insert and save it to db
//           // const { error } = await supabase
//           //   .from("proposals")
//           //   .insert({ data: data });

//           const { error } = await supabase.from("proposals2").insert({
//             operation_key: Object.keys(data)[0],
//             operation_value: Object.values(data)[0],
//           });
//           console.log({ error });
//         });
//       }
//     });
//   });

//   // Send a response back to Chainhook to acknowledge receipt of the event
//   res.status(200).send({ message: "Proposal added!" });
// });

// Start server on port 3000
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
