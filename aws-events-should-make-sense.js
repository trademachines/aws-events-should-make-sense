"use strict";

const AWS    = require('aws-sdk');
const config = require('aws-lambda-config');
const _      = require('lodash');

exports.makeSense = (event, context) => {
    config.getConfig(context, (err, cfg) => {
        if (err) return console.error(err);

        const sns = new AWS.SNS();

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

            const snsMsg     = _.template(_.get(sense, 'message', ''))({ msg: msg });
            const snsSubject = _.template(_.get(sense, 'subject', ''))({ msg: msg });

            sns.publish({ TopicArn: sense.to, Message: snsMsg, Subject: snsSubject }, (err, data) => {
                if (err) console.error(err);
            });
        });
    });
};
