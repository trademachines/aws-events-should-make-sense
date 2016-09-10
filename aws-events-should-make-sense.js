"use strict";

const AWS    = require('aws-sdk');
const config = require('aws-lambda-config');
const _      = require('lodash');

exports.makeSense = (event, context) => {
    config.getConfig(context, (err, cfg) => {
        if (err) return console.error(err);

        const sns = new AWS.SNS({ region: 'eu-west-1' });

        _.each(event.Records, (r) => {
            const sns = _.get(r, 'Sns');

            if (!sns) {
                return;
            }

            const topic = sns.TopicArn.replace(/arn:aws:sns:[^:]+:[^:]+:(.*)/, '$1');
            const sense = _.get(cfg, topic);

            if (!sense) {
                return;
            }

            const msg = JSON.parse(sns.Message);

            const topicArn   = sense.to;
            const snsMsg     = _.template(_.get(sense, 'message', ''))({ msg: msg });
            const snsSubject = _.template(_.get(sense, 'subject', ''))({ msg: msg });

            console.log(`Write to topic ${topicArn}, msg=${snsMsg}, subject=${snsSubject}`);

            sns.publish({ TopicArn: topicArn, Message: snsMsg, Subject: snsSubject }, (err, data) => {
                if (err) console.error(err);
            });
        });
    });
};
