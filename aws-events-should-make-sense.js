"use strict";

const AWS    = require('aws-sdk');
const config = require('aws-lambda-config');
const _      = require('lodash');

exports.makeSense = (event, context) => {
    console.log('Received event', JSON.stringify(event));

    config.getConfig(context, (err, cfg) => {
        if (err) return console.error(err);

        const sns = new AWS.SNS();

        const sendMessage = (topic, msg) => {
            const sense = _.get(cfg, topic);

            if (!sense) {
                return;
            }

            const topicArn   = sense.to;
            const snsMsg     = _.template(_.get(sense, 'message', ''))({ msg: msg });
            const snsSubject = _.template(_.get(sense, 'subject', ''))({ msg: msg });

            console.log(`Write to topic ${topicArn}, msg=${snsMsg}, subject=${snsSubject}`);

            sns.publish({ TopicArn: topicArn, Message: snsMsg, Subject: snsSubject }, (err, data) => {
                if (err) console.error(err);
            });
        };

        const getMessages = (msg) => {
            if (_.isString(msg)) {
                msg = JSON.parse(msg);
            }

            if (_.has(msg, 'Records')) {
                return msg.Records;
            } else {
                return [ msg ];
            }
        };

        const getTopic = (record) => {
            return record.TopicArn.replace(/arn:aws:sns:[^:]+:[^:]+:(.*)/, '$1');
        };

        try {
            _.each(event.Records, (r) => {
                if (r.EventSource !== 'aws:sns') {
                    throw new Error(`Can not handle ${record.EventSource}`)
                }

                const topic = getTopic(r.Sns);
                const msgs  = getMessages(r.Sns.Message);

                _.each(msgs, (m) => sendMessage(topic, m));
            });
        } catch (e) {

        }
    });
};
