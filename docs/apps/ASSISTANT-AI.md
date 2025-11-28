This is the [assistant-ui](https://github.com/Yonom/assistant-ui) starter project with RAG (Retrieval-Augmented Generation) capabilities.

## Getting Started

First, add your Google Gemini API key to `.env` file (in the monorepo root):

```
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
```

Then, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## RAG System Setup

This assistant includes a RAG (Retrieval-Augmented Generation) system that allows the chatbot to answer questions based on your personal knowledge base.

### 1. Ingest Demo Documents

First, ingest the demo documents to populate the vector store:

```bash
# Make a POST request to the ingest endpoint
curl -X POST http://localhost:3000/api/ingest
```

Or use any HTTP client to call `POST /api/ingest`.

### 2. Check Vector Store Status

You can check the status of your vector store:

```bash
curl http://localhost:3000/api/ingest
```

### 3. Start Chatting

Once documents are ingested, the chatbot will automatically retrieve relevant context from your knowledge base when answering questions.

## Adding Your Own Documents

1. Edit `apps/assistant-ai/data/demo-documents.json` to add your own documents
2. The format is:
   ```json
   {
     "documents": [
       {
         "id": "unique-id",
         "content": "Your document content here...",
         "metadata": {
           "category": "optional",
           "type": "optional"
         }
       }
     ]
   }
   ```
3. Call the ingest endpoint again to update the vector store

## Architecture

The RAG system consists of:

- **Vector Store**: Local file-based storage (`data/vector-store.json`)
- **Embeddings**: Google's text-embedding-004 model
- **Retrieval**: Cosine similarity search
- **Integration**: Automatic context injection into chat responses
