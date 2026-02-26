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

function wrapTextToLines(text: string, maxLineLength = 30): string {
  return text
    .split("\n")
    .flatMap((line) => {
      if (!line) {
        return [""];
      }

      const wrapped: string[] = [];
      let remaining = line;

      while (remaining.length > maxLineLength) {
        const breakIndex = remaining.lastIndexOf(" ", maxLineLength);

        if (breakIndex > 0) {
          wrapped.push(remaining.slice(0, breakIndex));
          remaining = remaining.slice(breakIndex + 1);
        } else {
          wrapped.push(remaining.slice(0, maxLineLength));
          remaining = remaining.slice(maxLineLength);
        }
      }

      wrapped.push(remaining);
      return wrapped;
    })
    .join("\n");
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
    const textblocks: TextReceiptData[] = [
      { 
        text: `================================\nSECRET MISSION SOCIETY\n================================\n\nYour mission, should you\nchoose to accept:\n\n`,
        coda: 'newline',
      }
    ];

    for (const pair of formData.entries()) {
      textblocks.push({
        text: wrapTextToLines(pair[1] as string),
        coda: 'newline'
      });
    }

    textblocks.push(
      {
        text: `\n\nReport back on zulip #sms\nand print the next mission.\n\nThe chain must continue.\n\n================================\nsms.recurse.com`
      }
    )
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
