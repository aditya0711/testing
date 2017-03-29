/**
 * Created by adityaaggarwal on 30/3/17.
 */

'use strict'
var Docker = require('dockerode');
var expect = require('chai').expect;
var Socket = require('net').Socket;

describe("Strato Container Testing", function() {

    var allContainers;
    var docker = new Docker({socketPath: '/var/run/docker.sock'});

    it('Should list containers', function (done) {
        console.log("Trying to pull a docker image");
        //followProgress(stream, onFinished, [onProgress])
        docker.listImages(function (err, list) {
            allContainers = list;
            console.log(JSON.stringify(allContainers));
            done();
        })
    });

    it('Should check logs of silo_strato_1', function (done) {

        var strato = docker.getContainer("744877418bc2");

        function handler(err, data) {
            // expect(err).to.be.null;
            // expect(data).to.be.ok;
            console.log("DATE" + JSON.stringify(data));
            done();
        }

        strato.inspect(handler);
    });
    it("should run exec on a container", function (done) {
        this.timeout(20000);
        var options = {
            Cmd: ["echo", "'foo'"]
        };

        var container = docker.getContainer("744877418bc2");

        function handler(err, exec) {
            //console.log(JSON.stringify(exec));
            exec.start(function (err, stream) {
                //console.log((stream));

                exec.inspect(function (err, data) {
                    console.log((data));

                    done();
                });
            });
        }

        container.exec(options, handler);
    });
});