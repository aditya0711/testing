/**
 * Created by adityaaggarwal on 29/3/17.
 */
'use strict'
var Docker = require('dockerode');
var expect = require('chai').expect;
var Socket = require('net').Socket;

describe("Container", function() {

    var configURL = "http://bayar3.eastus.cloudapp.azure.com";
    var bayarDocker =
        {
            host: configURL,
            port: 2376,
            protocol: 'http',
            // ca: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/ca.pem'),
            // key: fs.readFileSync(process.env.DOCKER_CERT_PATH + '/key.pem')
        };

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

        var strato = docker.getContainer("f8e7ae60d3ee");

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

        var container = docker.getContainer("f8e7ae60d3ee");

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
    it("should allow exec stream hijacking on a container", function (done) {
        this.timeout(10000);
        var options = {
            Cmd: ["cat"],
            AttachStdin: true,
            AttachStdout: true,
        };
        var startOpts = {
            hijack: true,
            stdin: true,
        };

        var container = docker.getContainer("f8e7ae60d3ee");

        function handler(err, exec) {
            expect(err).to.be.null;

            exec.start(startOpts, function (err, stream) {
                expect(err).to.be.null;
                //expect(stream).to.be.ok;
                expect(stream).to.be.an.instanceof(Socket);
                //return done();

                var SAMPLE = 'echo\nall\nof\nme\n';
                var bufs = [];
                stream.on('data', function (d) {
                    bufs.push(d);
                }).on('end', function () {
                    var out = Buffer.concat(bufs);
                    expect(out.readUInt8(0)).to.equal(1);
                    expect(out.readUInt32BE(4)).to.equal(SAMPLE.length);
                    expect(out.toString('utf8', 8)).to.equal(SAMPLE);
                    console.log(out);
                    done();
                });
                stream.end(SAMPLE);
                //stream.end();
            });
        }

        container.exec(options, handler);
    });

});