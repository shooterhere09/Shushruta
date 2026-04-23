const assert = require('assert');
const { calculateSimilarity } = require('./utils/nlp');
const Similarity = require('./controller/similarity');

// Mock Mongoose models
const mockUserModel = {
  findById: async (id) => {
    return new Promise((resolve) => {
      process.nextTick(() => {
        if (id === '60d5ec49f8e9a10015f8e9a1') {
          resolve({
            _id: '60d5ec49f8e9a10015f8e9a1',
            userType: 'patient',
            medicalReportContent: 'This patient has a severe heart condition requiring immediate transplant. The heart is enlarged and there is significant arterial blockage.',
            address: { latitude: 34.052235, longitude: -118.243683 }, // Los Angeles
          });
        } else if (id === '60d5ec49f8e9a10015f8e9a2') {
          resolve({
            _id: '60d5ec49f8e9a10015f8e9a2',
            userType: 'patient',
            medicalReportContent: '',
            address: { latitude: 34.052235, longitude: -118.243683 },
          });
        } else if (id === '60d5ec49f8e9a10015f8e9a3') {
          resolve({
            _id: '60d5ec49f8e9a10015f8e9a3',
            userType: 'hospital',
            medicalReportContent: 'Some content',
            hospitalInfo: { latitude: 34.052235, longitude: -118.243683 },
          });
        } else if (id === '60d5ec49f8e9a10015f8e9a4') {
          resolve({
            _id: '60d5ec49f8e9a10015f8e9a4',
            userType: 'patient',
            medicalReportContent: 'Patient needs a kidney. Blood type O positive.',
            address: { latitude: 34.052235, longitude: -118.243683 }, // Los Angeles
          });
        } else if (id === '60d5ec49f8e9a10015f8e9a5') {
          resolve({
            _id: '60d5ec49f8e9a10015f8e9a5',
            userType: 'patient',
            medicalReportContent: 'Patient needs a heart. Blood type A negative.',
            address: { latitude: 40.712776, longitude: -74.005974 }, // New York
          });
        }
        resolve(null);
      });
    });
  },
};

const mockProductModel = {
  find: async () => {
    return new Promise((resolve) => {
      process.nextTick(() => {
        resolve([
          {
            _id: 'organ1',
            pName: 'Heart A',
            pMedicalReport: 'This heart is healthy and suitable for transplant. No significant issues found. Compatible with blood type A.',
            latitude: 34.052235, longitude: -118.243683, // Los Angeles
          },
          {
            _id: 'organ2',
            pName: 'Kidney B',
            pMedicalReport: 'Kidney shows signs of mild inflammation, but generally healthy. Compatible with blood type B.',
            latitude: 34.052235, longitude: -118.243683, // Los Angeles
          },
          {
            _id: 'organ3',
            pName: 'Heart C',
            pMedicalReport: 'Patient has severe cardiac issues, including an enlarged heart and blocked arteries. Requires urgent replacement.',
            latitude: 40.712776, longitude: -74.005974, // New York
          },
          {
            _id: 'organ4',
            pName: 'Liver D',
            pMedicalReport: 'Liver is in excellent condition. No diseases or abnormalities detected. Compatible with blood type O.',
            latitude: 40.712776, longitude: -74.005974, // New York
          },
          {
            _id: 'organ5',
            pName: 'Heart E',
            pMedicalReport: 'This heart has minor calcification but is otherwise healthy. Suitable for transplant.',
            latitude: 34.052235, longitude: -118.243683, // Los Angeles
          },
          {
            _id: 'organ6',
            pName: 'Kidney F',
            pMedicalReport: 'Healthy kidney, suitable for transplant. Blood type O positive.',
            latitude: 34.052235, longitude: -118.243683, // Los Angeles
          },
          {
            _id: 'organ7',
            pName: 'Heart G',
            pMedicalReport: 'Healthy heart, compatible with blood type A negative.',
            latitude: 40.712776, longitude: -74.005974, // New York
          },
        ]);
      });
    });
  },
};

// Instantiate the controller with mock models
const similarityController = new Similarity(mockUserModel, mockProductModel);

function testCalculateSimilarity() {
  console.log("\nRunning calculateSimilarity tests...");

  // Test 1: Identical strings
  const sim1 = calculateSimilarity("hello world", "hello world");
  assert.ok(sim1 > 0.99, `Test 1 Failed: Identical strings should have high similarity. Got ${sim1}`);
  console.log("Test 1 Passed: Identical strings.");

  // Test 2: Completely different strings
  const sim2 = calculateSimilarity("apple banana", "orange grape");
  assert.ok(sim2 < 0.1, `Test 2 Failed: Different strings should have low similarity. Got ${sim2}`);
  console.log("Test 2 Passed: Different strings.");

  // Test 3: Partially similar strings
  const sim3 = calculateSimilarity("the quick brown fox", "a quick red fox");
  assert.ok(sim3 > 0.25 && sim3 < 0.7, `Test 3 Failed: Partially similar strings. Got ${sim3}`);
  console.log("Test 3 Passed: Partially similar strings.");

  // Test 4: Empty strings
  const sim4 = calculateSimilarity("", "hello");
  assert.strictEqual(sim4, 0, `Test 4 Failed: Empty string similarity. Got ${sim4}`);
  console.log("Test 4 Passed: Empty string.");

  const sim5 = calculateSimilarity("hello", "");
  assert.strictEqual(sim5, 0, `Test 5 Failed: Empty string similarity. Got ${sim5}`);
  console.log("Test 5 Passed: Empty string (second argument).");

  // Test 6: Strings with minor typos (fuzzy match)
  const sim6 = calculateSimilarity("heart condtion", "heart condition");
  assert.ok(sim6 > 0.5, `Test 6 Failed: Strings with minor typos should have reasonable similarity. Got ${sim6}`);
  console.log("Test 6 Passed: Strings with minor typos.");

  // Test 7: Strings with reordered words (fuzzy match)
  const sim7 = calculateSimilarity("condition heart severe", "severe heart condition");
  assert.ok(sim7 > 0.5, `Test 7 Failed: Strings with reordered words should have reasonable similarity. Got ${sim7}`);
  console.log("Test 7 Passed: Strings with reordered words.");

  // Test 8: Longer strings with some fuzzy matches
  const sim8 = calculateSimilarity("This patient has a severe heart condishun requiring immediate transplant.", "This patient has a severe heart condition requiring immediate transplant.");
  assert.ok(sim8 > 0.6, `Test 8 Failed: Longer strings with fuzzy matches. Got ${sim8}`);
  console.log("Test 8 Passed: Longer strings with fuzzy matches.");

  console.log("All calculateSimilarity tests completed.");
}

async function testGetRankedOrganReports() {
  console.log("\nRunning getRankedOrganReports tests...");

  // Mock response object
  const mockRes = {
    status: function (code) {
      this.statusCode = code;
      return this;
    },
    json: function (data) {
      this.body = data;
      return this;
    },
  };

  // Test 1: Valid patient with medical report
  const req1 = { body: { userId: '60d5ec49f8e9a10015f8e9a1' } };
  const res1 = { ...mockRes };
  await similarityController.getRankedOrganReports(req1, res1);
  assert.strictEqual(res1.statusCode, 200, `Test 1 Failed: Expected status 200. Got ${res1.statusCode}`);
  assert.ok(res1.body.rankedOrgans.length > 0, "Test 1 Failed: Expected ranked organs.");
  assert.ok(res1.body.rankedOrgans[0].combinedScore >= res1.body.rankedOrgans[1].combinedScore, "Test 1 Failed: Organs not ranked correctly by combined score.");
  console.log("Test 1 Passed: Valid patient with medical report.");

  // Test 6: Patient with specific medical need and location, expecting organs to be ranked by combined score
  const req6 = { body: { userId: '60d5ec49f8e9a10015f8e9a4' } }; // Patient in LA needing kidney
  const res6 = { ...mockRes };
  await similarityController.getRankedOrganReports(req6, res6);
  assert.strictEqual(res6.statusCode, 200, `Test 6 Failed: Expected status 200. Got ${res6.statusCode}`);
  assert.ok(res6.body.rankedOrgans.length > 0, "Test 6 Failed: Expected ranked organs.");
  // Verify that organ6 (Kidney F, LA) is ranked higher than organ4 (Liver D, NY) due to medical similarity and proximity
  const organ6 = res6.body.rankedOrgans.find(o => o.organ._id === 'organ6');
  const organ4 = res6.body.rankedOrgans.find(o => o.organ._id === 'organ4');
  assert.ok(organ6.combinedScore > organ4.combinedScore, "Test 6 Failed: Organ6 should be ranked higher than Organ4.");
  console.log("Test 6 Passed: Patient with specific medical need and location.");

  // Test 7: Patient in different location, expecting different ranking
  const req7 = { body: { userId: '60d5ec49f8e9a10015f8e9a5' } }; // Patient in NY needing heart
  const res7 = { ...mockRes };
  await similarityController.getRankedOrganReports(req7, res7);
  assert.strictEqual(res7.statusCode, 200, `Test 7 Failed: Expected status 200. Got ${res7.statusCode}`);
  assert.ok(res7.body.rankedOrgans.length > 0, "Test 7 Failed: Expected ranked organs.");
  // Verify that organ7 (Heart G, NY) is ranked higher than organ5 (Heart E, LA) due to medical similarity and proximity
  const organ7 = res7.body.rankedOrgans.find(o => o.organ._id === 'organ7');
  const organ5 = res7.body.rankedOrgans.find(o => o.organ._id === 'organ5');
  assert.ok(organ7.combinedScore > organ5.combinedScore, "Test 7 Failed: Organ7 should be ranked higher than Organ5.");
  console.log("Test 7 Passed: Patient in different location.");

  // Test 2: Missing userId
  const req2 = { body: {} };
  const res2 = { ...mockRes };
  await similarityController.getRankedOrganReports(req2, res2);
  assert.strictEqual(res2.statusCode, 400, `Test 2 Failed: Expected status 400. Got ${res2.statusCode}`);
  assert.strictEqual(res2.body.error, "User ID is required.", "Test 2 Failed: Expected 'User ID is required' error.");
  console.log("Test 2 Passed: Missing userId.");

  // Test 3: Patient not found
  const req3 = { body: { userId: '60d5ec49f8e9a10015f8e9a9' } };
  const res3 = { ...mockRes };
  await similarityController.getRankedOrganReports(req3, res3);
  assert.strictEqual(res3.statusCode, 404, `Test 3 Failed: Expected status 404. Got ${res3.statusCode}`);
  assert.strictEqual(res3.body.error, "Patient not found or is not a patient user.", "Test 3 Failed: Expected 'Patient not found' error.");
  console.log("Test 3 Passed: Patient not found.");

  // Test 4: User is not a patient
  const req4 = { body: { userId: '60d5ec49f8e9a10015f8e9a3' } };
  const res4 = { ...mockRes };
  await similarityController.getRankedOrganReports(req4, res4);
  assert.strictEqual(res4.statusCode, 404, `Test 4 Failed: Expected status 404. Got ${res4.statusCode}`);
  assert.strictEqual(res4.body.error, "Patient not found or is not a patient user.", "Test 4 Failed: Expected 'User is not a patient' error.");
  console.log("Test 4 Passed: User is not a patient.");

  // Test 5: Patient has no medical report content
  const req5 = { body: { userId: '60d5ec49f8e9a10015f8e9a2' } };
  const res5 = { ...mockRes };
  await similarityController.getRankedOrganReports(req5, res5);
  assert.strictEqual(res5.statusCode, 400, `Test 5 Failed: Expected status 400. Got ${res5.statusCode}`);
  assert.strictEqual(res5.body.error, "Patient has no medical report uploaded.", "Test 5 Failed: Expected 'Patient has no medical report' error.");
  console.log("Test 5 Passed: Patient has no medical report content.");

  console.log("All getRankedOrganReports tests completed.");
}

// Run all tests
(async () => {
  try {
    testCalculateSimilarity();
    await testGetRankedOrganReports();
    console.log("\nAll similarity tests passed successfully!");
  } catch (error) {
    console.error("\nSimilarity tests failed:", error.message);
  }
})();