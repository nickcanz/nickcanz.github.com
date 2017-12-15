---
layout: post
title:  "Helping with man page muscle memory"
date:   2017-12-15 12:48:00
categories: bash man
---

Man pages are great. They can be a bit hard to read but when you're trying to figure out a specific flag to `ls` ([which has a _lot_ of flags](http://linuxcommand.org/lc3_man_pages/ls1.html)) it's the best way to learn. Whenever I have questions about a command, I pop open a terminal and type 

```
man <command>
```

Which now-a-days doesn't return all that often. Most new commands you'll install won't have a man page. Take [go](https://golang.org/).  `man go` will return an error. But almost all commands support a help flag with `-h`.

```
$ go -h
Go is a tool for managing Go source code.

Usage:

  go command [arguments]

The commands are:

  build       compile packages and dependencies
  clean       remove object files
  doc         show documentation for package or symbol
...etc etc
```

I found myself typing a lot of `man go`, getting an error, and then typing `go -h`. For not just go, but other commmands as well. So I made a bash alias. In your `.bashrc` or similar file, this function changes what `man` does. It trys to run `man` for a given command and if that returns an error runs the command with `-h`.

{% highlight bash %}
function man_or_help() {
  # Run man with all the passed arguments to the function
  # \man will run the command with _no_ aliases. So it will work even if you aliased man to ls or something. You can do this with any command on a system with aliases you're unsure about, like `\ls` or `\rm`
  \man "$@"


  # $? is a special variable that has the exit code of the last command. 0 is "success" and anything else means an error happend.
  if [ $? -ne 0 ]
  then
    # $? was not equal to 0. So we try running the first argument with the standard help flag of `-h`.
    "$1" -h
  fi
}

# Instead of the normal man command, run the function we just made when you type man on the terminal.
alias man='man_or_help
{% endhighlight %}
