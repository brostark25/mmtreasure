import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import xml2js from "xml2js"; // Install this package using `npm install xml2js` if not already installed.

dotenv.config();

const sbApiUrl =
  process.env.SPORTBOOK_API_URL ||
  "http://apisbtest_burma03.gksic5ousjiw9pldk3apx6dmbte.com/SportsbookApiWebService.asmx";
const sbSecretKey = process.env.SPORTBOOK_API_KEY || "159752";
const sbAgent = process.env.SPORTBOOK_AGENT_NAME || "ismmc9";

// Helper function to make SOAP requests
const makeSoapRequest = async (url, soapBody, soapAction) => {
  try {
    const response = await axios.post(url, soapBody, {
      headers: {
        "Content-Type": "text/xml; charset=utf-8",
        SOAPAction: soapAction,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error making SOAP request:", error.message);
    throw new Error("SOAP request failed.");
  }
};

// SOAP Action Implementations

// Create Account
export const createSBAccount = async (req, res) => {
  const { userName } = req.body;
  const soapBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <CreateAccount xmlns="http://sportsbookapiws.org/">
          <secret>${sbSecretKey}</secret>
          <userName>${userName}</userName>
          <agent>${sbAgent}</agent>
        </CreateAccount>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/CreateAccount"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Account Balance
export const getSbAccountBalance = async (req, res) => {
  const { userName } = req.body;
  const soapBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetAccountBalance xmlns="http://sportsbookapiws.org/">
          <secret>${sbSecretKey}</secret>
          <userName>${userName}</userName>
          <agent>${sbAgent}</agent>
        </GetAccountBalance>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/GetAccountBalance"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch Tickets
export const fetchticket = async (req, res) => {
  const soapBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <Fetch xmlns="http://sportsbookapiws.org/">
          <secret>${sbSecretKey}</secret>
          <agent>${sbAgent}</agent>
        </Fetch>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/Fetch"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark Fetched Tickets
export const markFetched = async (req, res) => {
  const { fetchIds } = req.body;
  const soapBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <MarkFetched xmlns="http://sportsbookapiws.org/">
          <secret>${sbSecretKey}</secret>
          <agent>${sbAgent}</agent>
          <fetchIds>${fetchIds}</fetchIds>
        </MarkFetched>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/MarkFetched"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Login URL
export const getLoginUrl = async (req, res) => {
  const { userName, language } = req.body;

  const soapBody = `
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetLoginUrl xmlns="http://sportsbookapiws.org/">
          <secret>${sbSecretKey}</secret>
          <userName>${userName}</userName>
          <agent>${sbAgent}</agent>
          <language>${language}</language>
        </GetLoginUrl>
      </soap:Body>
    </soap:Envelope>
  `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/GetLoginUrl"
    );

    console.log("Raw SOAP Response:", result);

    // Check if the response is a valid string
    if (
      !result ||
      typeof result !== "string" ||
      !result.trim().startsWith("<?xml")
    ) {
      res
        .status(400)
        .json({
          success: false,
          message: "Invalid response from SOAP request",
        });
      return;
    }

    const xmlResponse = result;

    const parser = new xml2js.Parser({ explicitArray: false });
    parser.parseString(xmlResponse, (err, parsedResult) => {
      if (err) {
        console.error("Error parsing XML:", err);
        res
          .status(500)
          .json({ success: false, message: "Error parsing XML response" });
        return;
      }

      // Extract the login URL from the parsed XML
      const loginUrl =
        parsedResult?.["soap:Envelope"]?.["soap:Body"]?.[
          "GetLoginUrlResponse"
        ]?.["loginUrl"];

      if (loginUrl) {
        // Replace &amp; with & and return the sanitized URL
        const sanitizedUrl = loginUrl.replace(/&amp;/g, "&");
        res.json({ success: true, loginUrl: sanitizedUrl });
      } else {
        res
          .status(400)
          .json({ success: false, message: "Login URL not found in response" });
      }
    });
  } catch (error) {
    console.error("Error during SOAP request:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

//Update Member Settings
export const updateMemberSettings = async (req, res) => {
  const { userName, max1, lim1, lim2, isSuspended, comType, com1, com2, com3 } =
    req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <UpdateMemberSettings xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <userName>${userName}</userName>
            <agent>${sbAgent}</agent>
            <max1>${max1}</max1>
            <lim1>${lim1}</lim1>
            <lim2>${lim2}</lim2>
            <isSuspended>${isSuspended}</isSuspended>
            <comType>${comType}</comType>
            <com1>${com1}</com1>
            <com2>${com2}</com2>
            <com3>${com3}</com3>
          </UpdateMemberSettings>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/UpdateMemberSettings"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transfer Fund With Ref
export const transferFundWithRef = async (req, res) => {
  const { userName, serial, amount } = req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <TransferFundWithRef xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <userName>${userName}</userName>
            <agent>${sbAgent}</agent>
            <serial>${serial}</serial>
            <amount>${amount}</amount>
          </TransferFundWithRef>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/TransferFundWithRef"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Verify Deposit Withdraw
export const verifyDepositWithdraw = async (req, res) => {
  const { serial } = req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <VerifyDepositWithraw xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <agent>${sbAgent}</agent>
            <serial>${serial}</serial>
          </VerifyDepositWithraw>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/VerifyDepositWithraw"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get Team
export const getTeam = async (req, res) => {
  const { teamId } = req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetTeam xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <teamId>${teamId}</teamId>
            <agent>${sbAgent}</agent>
          </GetTeam>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/GetTeam"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get League
export const getLeague = async (req, res) => {
  const { leagueId } = req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetLeague xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <leagueId>${leagueId}</leagueId>
            <agent>${sbAgent}</agent>
          </GetLeague>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/GetLeague"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//Get Parlay
export const getParlay = async (req, res) => {
  const { ticketId } = req.body;

  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <GetParlay xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <ticketId>${ticketId}</ticketId>
            <agent>${sbAgent}</agent>
          </GetParlay>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/GetParlay"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Logout
export const sbLogout = async (req, res) => {
  const { userName } = req.body;
  const soapBody = `
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <Logout xmlns="http://sportsbookapiws.org/">
            <secret>${sbSecretKey}</secret>
            <userName>${userName}</userName>
            <agent>${sbAgent}</agent>
          </Logout>
        </soap:Body>
      </soap:Envelope>
    `;

  try {
    const result = await makeSoapRequest(
      sbApiUrl,
      soapBody,
      "http://sportsbookapiws.org/Logout"
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
