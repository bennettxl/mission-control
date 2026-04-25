
export default function TechStackPage() {
  const htmlContent = `<html>
    <head>
        <meta charset=\"utf-8\">
        
            <script src=\"lib/bindings/utils.js\"></script>
            <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/dist/vis-network.min.css\" integrity=\"sha512-WgxfT5LWjfszlPHXRmBWHkV2eceiWTOBvrKCNbdgDYTHrT2AeLCGbF4sZlZw3UMN3WtL0tGUoIAKsu8mllg/XA==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\" />
            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/vis-network/9.1.2/dist/vis-network.min.js\" integrity=\"sha512-LnvoEWDFrqGHlHmDD2101OrLcbsfkrzoSpvtSQtxK3RMnRV0eOkhhBN2dXHKRrUU8p2DGRTk35n4O8nWSVe1mQ==\" crossorigin=\"anonymous\" referrerpolicy=\"no-referrer\"></script>
            
        
<center>
<h1></h1>
</center>

<!-- <link rel=\"stylesheet\" href=\"../node_modules/vis/dist/vis.min.css\" type=\"text/css\" />
<script type=\"text/javascript\" src=\"../node_modules/vis/dist/vis.js\"> </script>-->
        <link
          href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/css/bootstrap.min.css\"
          rel=\"stylesheet\"
          integrity=\"sha384-eOJMYsd53ii+scO/bJGFsiCZc+5NDVN2yr8+0RDqr0Ql0h+rP48ckxlpbzKgwra6\"
          crossorigin=\"anonymous\"
        />
        <script
          src=\"https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta3/dist/js/bootstrap.bundle.min.js\"
          integrity=\"sha384-JEW9xMcG8R+pH31jmWH6WWP0WintQrMb4s7ZOdauHnUtxwoG2vI5DkLtS3qm9Ekf\"
          crossorigin=\"anonymous\"
        ></script>


        <center>
          <h1></h1>
        </center>
        <style type=\"text/css\">

             #mynetwork {
                 width: 100%;
                 height: 100%;
                 background-color: #222222;
                 border: 1px solid lightgray;
                 position: relative;
                 float: left;
             }

             

             

             
        </style>
    </head>


    <body>
        <div class=\"card\" style=\"width: 100%\">
            
            
            <div id=\"mynetwork\" class=\"card-body\"></div>
        </div>

        
        

        <script type=\"text/javascript\">

              // initialize global variables.
              var edges;
              var nodes;
              var allNodes;
              var allEdges;
              var nodeColors;
              var originalNodes;
              var network;
              var container;
              var options, data;
              var filter = {
                  item : '',
                  property : '',
                  value : []
              };

              

              

              // This method is responsible for drawing the graph, returns the drawn network
              function drawGraph() {
                  var container = document.getElementById('mynetwork');

                  

                  // parsing and collecting nodes and edges from the python
                  nodes = new vis.DataSet([{\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Apple +\", \"label\": \"Apple +\", \"shape\": \"dot\", \"title\": \"Media \\u0026 Entertainment\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Opus Clips\", \"label\": \"Opus Clips\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"github\", \"label\": \"github\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"supabase\", \"label\": \"supabase\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Centerfy\", \"label\": \"Centerfy\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Audible\", \"label\": \"Audible\", \"shape\": \"dot\", \"title\": \"Media \\u0026 Entertainment\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Canva\", \"label\": \"Canva\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Hai\", \"label\": \"Hai\", \"shape\": \"dot\", \"title\": \"Other\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Mid Journey\", \"label\": \"Mid Journey\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Perplexity\", \"label\": \"Perplexity\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Durable\", \"label\": \"Durable\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"GoHighLevel\", \"label\": \"GoHighLevel\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Twilio\", \"label\": \"Twilio\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Google Ultra / Gemini\", \"label\": \"Google Ultra / Gemini\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"HeyGen\", \"label\": \"HeyGen\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Claude Max\", \"label\": \"Claude Max\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Plai.io\", \"label\": \"Plai.io\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Loveable.dev\", \"label\": \"Loveable.dev\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"ChatGPT\", \"label\": \"ChatGPT\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Eleven Labs\", \"label\": \"Eleven Labs\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Spotify\", \"label\": \"Spotify\", \"shape\": \"dot\", \"title\": \"Media \\u0026 Entertainment\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"n8n\", \"label\": \"n8n\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Kie\", \"label\": \"Kie\", \"shape\": \"dot\", \"title\": \"Other\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Microsoft Business\", \"label\": \"Microsoft Business\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Telegram\", \"label\": \"Telegram\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Notebook LM\", \"label\": \"Notebook LM\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"descript\", \"label\": \"descript\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Capcut (Plus Workspace)\", \"label\": \"Capcut (Plus Workspace)\", \"shape\": \"dot\", \"title\": \"Content \\u0026 Creative\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Notion (Trial Business)\", \"label\": \"Notion (Trial Business)\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Cursor\", \"label\": \"Cursor\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Notion Connections\", \"label\": \"Notion Connections\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Atlas\", \"label\": \"Atlas\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Visual Studio\", \"label\": \"Visual Studio\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Codex\", \"label\": \"Codex\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Hugging Face\", \"label\": \"Hugging Face\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"VS Code\", \"label\": \"VS Code\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Vercel\", \"label\": \"Vercel\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Netlify\", \"label\": \"Netlify\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"github copilot\", \"label\": \"github copilot\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"OpenRouter\", \"label\": \"OpenRouter\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"QuickBooks (Intuit)\", \"label\": \"QuickBooks (Intuit)\", \"shape\": \"dot\", \"title\": \"Finance \\u0026 Admin\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Docker\", \"label\": \"Docker\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"The AI Club (A3)\", \"label\": \"The AI Club (A3)\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Nate\\\'s Substack\", \"label\": \"Nate\\\'s Substack\", \"shape\": \"dot\", \"title\": \"Other\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Google Workspace (Perkins)\", \"label\": \"Google Workspace (Perkins)\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Slack\", \"label\": \"Slack\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Anthropic API (Claude)\", \"label\": \"Anthropic API (Claude)\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Google Workspace (XLInteractive)\", \"label\": \"Google Workspace (XLInteractive)\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Hostinger\", \"label\": \"Hostinger\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Quicken Simplifi\", \"label\": \"Quicken Simplifi\", \"shape\": \"dot\", \"title\": \"Finance \\u0026 Admin\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Skool\", \"label\": \"Skool\", \"shape\": \"dot\", \"title\": \"Communications \\u0026 Community\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Mac Mini Fleet (4x) \\u2014 Electricity\", \"label\": \"Mac Mini Fleet (4x) \\u2014 Electricity\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Bee Computer\", \"label\": \"Bee Computer\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Amazon Prime\", \"label\": \"Amazon Prime\", \"shape\": \"dot\", \"title\": \"Media \\u0026 Entertainment\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Tailscale\", \"label\": \"Tailscale\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Firecrawl\", \"label\": \"Firecrawl\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"1Password\", \"label\": \"1Password\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Antigravity\", \"label\": \"Antigravity\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"OpenClaw\", \"label\": \"OpenClaw\", \"shape\": \"dot\", \"title\": \"AI \\u0026 Automation\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Internet / ISP\", \"label\": \"Internet / ISP\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"LinkedIn Premium\", \"label\": \"LinkedIn Premium\", \"shape\": \"dot\", \"title\": \"Productivity \\u0026 Office\"}, {\"color\": \"#d3d3d3\", \"font\": {\"color\": \"white\"}, \"id\": \"Domain Registrations\", \"label\": \"Domain Registrations\", \"shape\": \"dot\", \"title\": \"Dev Tools \\u0026 Infrastructure\"}]);
                  edges = new vis.DataSet([]);

                  nodeColors = {};
                  allNodes = nodes.get({ returnType: \"Object\" });
                  for (nodeId in allNodes) {
                    nodeColors[nodeId] = allNodes[nodeId].color;
                  }
                  allEdges = edges.get({ returnType: \"Object\" });
                  // adding nodes and edges to the graph
                  data = {nodes: nodes, edges: edges};

                  var options = {
    \"configure\": {
        \"enabled\": false
    },
    \"edges\": {
        \"color\": {
            \"inherit\": true
        },
        \"smooth\": {
            \"enabled\": true,
            \"type\": \"dynamic\"
        }
    },
    \"interaction\": {
        \"dragNodes\": true,
        \"hideEdgesOnDrag\": false,
        \"hideNodesOnDrag\": false
    },
    \"physics\": {
        \"enabled\": true,
        \"stabilization\": {
            \"enabled\": true,
            \"fit\": true,
            \"iterations\": 1000,
            \"onlyDynamicEdges\": false,
            \"updateInterval\": 50
        }
    }
};

                  


                  

                  network = new vis.Network(container, data, options);

                  

                  

                  


                  

                  return network;

              }
              drawGraph();
        </script>
    </body>
</html>`;

  return (
    <div className=\"w-full h-screen\">
      <iframe
        srcDoc={htmlContent}
        className=\"w-full h-full border-0\"
        title=\"Tech Stack Visualization\"
      />
    </div>
  );
}
