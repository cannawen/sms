import ollie from "./assets/ollie.png";
import "./App.css";
import { Form } from "./components/Form";
import Anchor from "./components/Anchor/Anchor";

interface TextReceiptData {
  text?: string;
  underline?: boolean;
  bold?: boolean;
  font?: "a" | "b";
  invert?: boolean;
  letterSpacing?: number;
  scaleWidth?: number;
  scaleHeight?: number;
  coda?: string;
}

function getCookieValue(cookie: string): string {
  return (
    cookie
      .split("; ")
      .find((row) => row.startsWith("receipt_csrf="))
      ?.split("=")[1] || ""
  );
}

function App() {
  let endpoint = "https://receipt.recurse.com/text";

  if (import.meta.env.DEV) {
    document.cookie = "receipt_csrf=dev_token; path=/";
    endpoint = "http://localhost:3000/text";
  }
  const token = getCookieValue(document.cookie);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    var formData = new FormData(e.target);
    let currentId = "";
    let currentOptions = {};
    const textblocks: TextReceiptData[] = [
      { 
        text: 
        `================================
        SECRET MISSION SOCIETY
        ================================

        Your mission, should you
        choose to accept:`
      }
    ];

    // group form data by id
    for (const pair of formData.entries()) {
      const [id, optionName] = pair[0].split("-", 2);
      let optionValue = pair[1];

      if (currentId === id) {
        if (optionName === "spacing") {
          // TODO: remove once spacing is fixed
          continue;
        }
        currentOptions = { ...currentOptions, [optionName]: optionValue };
      } else {
        if (Object.keys(currentOptions).length > 0)
          textblocks.push(currentOptions);
        if (optionName === "spacing") {
          // TODO: remove once spacing is fixed
          currentOptions = {};
          currentId = id;
          continue;
        }
        currentOptions = { [optionName]: optionValue };
        currentId = id;
      }
    }

    textblocks.push(
      {
        text: 
        `Report back on zulip #sms
        and print the next mission.

        The chain must continue.

        ================================
        sms.recurse.com`
      }
    )

    // last text call cuts the paper
    currentOptions = { ...currentOptions, coda: "cut" };
    textblocks.push(currentOptions);

    // TODO: fix spacing + coda:space, coda:none
    try {
      let response;
      for (const block of textblocks) {
        response = await fetch(endpoint, {
          method: "POST",
          body: JSON.stringify({ ...block }),
          credentials: "include",
          headers: {
            "X-CSRF-Token": token,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
      }

      const result = await response?.json();
      console.log(result);
    } catch (error) {
      let err = error as Error;
      console.error(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-24px)]">
      <div className="grow">
        <br />
        <br />
        <br />
        <br />
        <h1 className="text-center">Secret Mission Society</h1>
        <br />
        <br />
        <p className="text-center">
          The chain must continue.
        </p>
        <br />
        <br />
        {token ? (
          <>
            <Form onFormSubmit={onSubmit} />
            <br />
            <br />
            <div className="flex justify-center py-4 ">
              <img
                src={ollie}
                className="h-16 w-16 mx-4"
                alt="Octopus emoji expressing excitement"
              />
            </div>
          </>
        ) : (
          <div className="text-center mt-10">
            <p>you are not authenticated.</p>
            <p>
              <Anchor href="https://receipt.recurse.com/login?redirect_uri=https://sms.recurse.com">
                log in to the receipt printer API
              </Anchor>
            </p>
          </div>
        )}
      </div>
      <footer className="flex justify-between mt-24 ">
        <Anchor href="https://github.com/cannawen/sms">
          about
        </Anchor>
        <Anchor href="https://receipt.recurse.com/">printer api</Anchor>
      </footer>
    </div>
  );
}

export default App;
