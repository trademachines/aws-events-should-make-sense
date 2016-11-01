"use strict";

const AWS    = require('aws-sdk');
const config = require('aws-lambda-config');
const _      = require('lodash');

exports.makeSense = (event, context) => {
    console.log('Received event', JSON.stringify(event));

    config.getConfig(context, (err, cfg) => {
        if (err) return console.error(err);

        const sns              = new AWS.SNS();
        const handleRecordList = (list) => {
            _.each(list, handleRecord);
        };
        const handleRecord     = (r) => {
            const snsInfo = _.get(r, 'Sns');
            if (!snsInfo) {
                return;
            }

            if (_.has(snsInfo, 'Records')) {
                return handleRecordList(snsInfo.Records);
            }

            const topic = snsInfo.TopicArn.replace(/arn:aws:sns:[^:]+:[^:]+:(.*)/, '$1');
            const sense = _.get(cfg, topic);

            if (!sense) {
                return;
            }

            const msg = JSON.parse(snsInfo.Message);

            console.log('Parsed msg', snsInfo.Message, msg);

            const topicArn   = sense.to;
            const snsMsg     = _.template(_.get(sense, 'message', ''))({ msg: msg });
            const snsSubject = _.template(_.get(sense, 'subject', ''))({ msg: msg });

            console.log(`Write to topic ${topicArn}, msg=${snsMsg}, subject=${snsSubject}`);

            sns.publish({ TopicArn: topicArn, Message: snsMsg, Subject: snsSubject }, (err, data) => {
                if (err) console.error(err);
            });
        };

        handleRecordList(sns, event.Records)
    });
};
