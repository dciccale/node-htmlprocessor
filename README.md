# htmlprocessor

`npm install -g htmlprocessor`

### Grunt task

This module was originally merged into the [grunt-processhtml](http://github.com/dciccale/grunt-processhtml) task.

Now its a standalone module without grunt dependency.

For plenty of documentation please visit [grunt-processhtml](http://github.com/dciccale/grunt-processhtml)

## CLI

```bash
$ htmlprocessor -v
```

Outputs to `file-to-process.processed.html`.

```bash
$ htmlprocessor file-to-process.html
```

Outputs to `processed/file.html`.

```bash
$ htmlprocessor file-to-process.html -o processed/file.html
```

Pass some data

```bash
$ htmlprocessor file-to-process.html -o processed/file.html -d data.json
```

Specify an environment

```bash
$ htmlprocessor file-to-process.html -o processed/file.html -e dev
```

Allow recursive processing

```bash
$ htmlprocessor file-to-process.html -o processed/file.html -r
```

Change the comment marker to `<!-- process --><!-- /process -->`

```bash
$ htmlprocessor file-to-process.html -o processed/file.html --comment-marker process
```

## License
See [LICENSE.txt](https://raw.github.com/dciccale/node-htmlprocessor/master/LICENSE-MIT)
