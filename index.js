const https = require('https');

const rates = {
    life: [
        0.279,
        0.4396,
        0.5599,
    ],
    dental: [
        0.12,
        0.1950,
        0.2480,
    ],
};

async function main(data) {
    let parsedData;
    try {
        parsedData = JSON.parse(data);
    } catch (err) {
        console.error('Error parsing response as JSON: ', err);
        return;
    }
    console.log('Received data parsed succesfully, processing.');
    console.log(`has_dental_care: ${parsedData.policy.has_dental_care}`);
    console.log(`company_percentage: ${parsedData.policy.company_percentage}`);
    let totalPolicyValue = 0;
    const policyPercentage = parsedData.policy.company_percentage / 100;
    parsedData.policy.workers.forEach((worker, wIndex) => {
        console.log(worker);
        let childrenFactor;
        if (isNaN(parseInt(worker.childs))) {
            console.log('nan found, seting "childs" to zero for worker on index: ' + wIndex);
            worker.childs = 0;
        }
        if (parseInt(worker.childs) > 2) {
            childrenFactor = 2;
        } else {
            childrenFactor = parseInt(worker.childs);
        }
        let workerCost = rates.life[childrenFactor];
        // console.log(rates.life[childrenFactor]);
        if (parsedData.policy.has_dental_care) {
            workerCost += rates.dental[childrenFactor]
        }
        console.log(workerCost);
        totalPolicyValue += workerCost;
        worker.copay = workerCost - workerCost * policyPercentage;
    });
    parsedData.policy.totalCost = totalPolicyValue;
    console.log(JSON.stringify(parsedData, null, 4));
}
console.log('Requesting data from server');
https.get('https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy', (response) => {
    let data = '';
    response.on('data', (chunk) => {
        console.log('.');
        data += chunk;
    });
    response.on('end', () => {
        console.log(`Received: ${data.length}B`);
        // console.log(data.toString());
        main(data);
    });

}).on("error", (err) => {
    console.error('Error requesting data from the server: ', err);
});