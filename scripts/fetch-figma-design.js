#!/usr/bin/env node

/**
 * Script to fetch Figma design data for the splash screen
 * Usage: node scripts/fetch-figma-design.js
 */

const FIGMA_API_KEY = 'figd_ZwjIOCppKr-7tUrapQoXGhheRgR6ZM_PaA-ATe9D';
const FIGMA_FILE_KEY = 'Q5IhAuBOfjRsqYZzhiCS4E';
const NODE_ID = '7952-78560';

async function fetchFigmaNode() {
  try {
    const response = await fetch(
      `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/nodes?ids=${NODE_ID}`,
      {
        headers: {
          'X-Figma-Token': FIGMA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Figma data:', error.message);
    throw error;
  }
}

async function fetchFigmaFile() {
  try {
    const response = await fetch(`https://api.figma.com/v1/files/${FIGMA_FILE_KEY}`, {
      headers: {
        'X-Figma-Token': FIGMA_API_KEY,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Figma file:', error.message);
    throw error;
  }
}

async function fetchFigmaImages(nodeIds) {
  try {
    const response = await fetch(
      `https://api.figma.com/v1/images/${FIGMA_FILE_KEY}?ids=${nodeIds.join(',')}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': FIGMA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Figma API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Figma images:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Fetch file data
    const fileData = await fetchFigmaFile();
    
    // Fetch node data
    const nodeData = await fetchFigmaNode();
    
    if (nodeData.nodes && nodeData.nodes[NODE_ID]) {
      const node = nodeData.nodes[NODE_ID].document;
      
      // Extract design specs
      const specs = {
        name: node.name,
        type: node.type,
        width: node.absoluteBoundingBox?.width,
        height: node.absoluteBoundingBox?.height,
        backgroundColor: node.backgroundColor,
        fills: node.fills,
        effects: node.effects,
        children: node.children?.map((child) => ({
          name: child.name,
          type: child.type,
          fills: child.fills,
          absoluteBoundingBox: child.absoluteBoundingBox,
        })),
      };

      // Fetch images if needed
      if (node.children?.some((child) => child.type === 'IMAGE' || child.fills?.some((fill) => fill.type === 'IMAGE'))) {
        const imageNodeIds = [NODE_ID];
        const imageData = await fetchFigmaImages(imageNodeIds);
      }

      return specs;
    } else {
      console.error('Node not found in response');
      return null;
    }
  } catch (error) {
    console.error('\nError:', error.message);
    if (error.message.includes('429')) {
      console.error('\nRate limit exceeded. Please wait a few minutes and try again.');
    }
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { fetchFigmaNode, fetchFigmaFile, fetchFigmaImages };
