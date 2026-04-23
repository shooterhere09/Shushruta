const natural = require('natural');
const Fuse = require('fuse.js');

const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;

const preprocessText = (text) => {
  if (!text) return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  // Add more preprocessing steps here if needed, e.g., remove stopwords, stemming
  return tokens;
};




const calculateFuzzySimilarity = (text1, text2) => {
  const tokens1 = preprocessText(text1);
  const tokens2 = preprocessText(text2);

  if (tokens1.length === 0 || tokens2.length === 0) {
    return 0;
  }

  const fuse = new Fuse(tokens2, {
    includeScore: true,
    threshold: 0.4, // Adjusted threshold for slightly more lenient fuzzy matching
  });

  let totalFuzzyScore = 0;
  tokens1.forEach(token => {
    const result = fuse.search(token);
    if (result.length > 0) {
      totalFuzzyScore += (1 - result[0].score);
    }
  });

  return tokens1.length > 0 ? totalFuzzyScore / tokens1.length : 0;
};

const calculateSimilarity = (text1, text2) => {
  const tfidf = new TfIdf();

  const doc1 = preprocessText(text1);
  const doc2 = preprocessText(text2);

  tfidf.addDocument(doc1);
  tfidf.addDocument(doc2);

  const vector1 = {};
  const vector2 = {};

  tfidf.listTerms(0).forEach(item => {
    vector1[item.term] = item.tfidf;
  });

  tfidf.listTerms(1).forEach(item => {
    vector2[item.term] = item.tfidf;
  });

  const dotProduct = Object.keys(vector1).reduce((sum, key) => {
    if (vector2[key]) {
      sum += vector1[key] * vector2[key];
    }
    return sum;
  }, 0);

  const magnitude1 = Math.sqrt(Object.values(vector1).reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vector2).reduce((sum, val) => sum + val * val, 0));

  let cosineSimilarity = 0;
  if (magnitude1 !== 0 && magnitude2 !== 0) {
    cosineSimilarity = dotProduct / (magnitude1 * magnitude2);
  }

  // Combine TF-IDF cosine similarity with fuzzy similarity
  const fuzzySimilarity = calculateFuzzySimilarity(text1, text2);
  const weightedSimilarity = (cosineSimilarity * 0.6) + (fuzzySimilarity * 0.4); // Adjusted weights

  return weightedSimilarity;
};

module.exports = { preprocessText, calculateSimilarity };