// app/api/urlcheck/route.js
export async function POST(req) {
    const { url } = await req.json();
    const API_KEY = "973bf1790f02be24f02847c3071b721cd4e3f9b6de365c805c97ab236885c188"; // Replace with your VirusTotal API key
  
    try {
      // Encode URL as base64 as required by VirusTotal
      const encodedUrl = Buffer.from(url).toString('base64');
  
      // Make the API request to VirusTotal
      const response = await fetch(`https://www.virustotal.com/api/v3/urls/${encodedUrl}`, {
        method: 'GET',
        headers: {
          'x-apikey': API_KEY, // Use your VirusTotal API key here
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch data from VirusTotal.");
      }
  
      const data = await response.json();
  
      // Get analysis results from VirusTotal
      const analysisStats = data.data.attributes.last_analysis_stats;
      const maliciousResults = analysisStats.malicious || 0;
      const phishingResults = analysisStats.phishing || 0;
      const defacementResults = analysisStats.defacement || 0;
      const harmlessResults = analysisStats.harmless || 0;
  
      let prediction = 'benign';
      let description = 'This URL is safe to visit.';
      let confidence = 100;
  
      // Classify the URL based on VirusTotal analysis
      if (maliciousResults > harmlessResults) {
        prediction = 'malware';
        description = 'This URL is flagged as malware and may contain harmful content.';
        confidence = (maliciousResults / (maliciousResults + harmlessResults) * 100).toFixed(2);
      } else if (phishingResults > harmlessResults) {
        prediction = 'phishing';
        description = 'This URL is flagged as phishing and may attempt to steal sensitive information.';
        confidence = (phishingResults / (phishingResults + harmlessResults) * 100).toFixed(2);
      } else if (defacementResults > harmlessResults) {
        prediction = 'defacement';
        description = 'This URL may be associated with website defacement.';
        confidence = (defacementResults / (defacementResults + harmlessResults) * 100).toFixed(2);
      }
  
      return new Response(JSON.stringify({ result: prediction, description, confidence }), { status: 200 });
  
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  }
  