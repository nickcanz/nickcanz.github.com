---
layout: post
title:  "Calling Erlang code from Elixir: a tale of hubris, strings, and how to read the documentation"
date:   2015-08-03 21:41:00
categories: elixir erlang
---

I’ve been playing around with Elixir recently and thought I’d share one of the hurdles I came across.

So, I know _slightly_ more than nothing about Elixir and Erlang. I also can’t read through a tutorial to save my life. I learn best by picking a small task and then using my finely honed Google skills to accomplish the task.

The task I wanted to accomplish was to lookup a DNS record for a domain. Luckily, Erlang has a built in function to accomplish this, [inet_res:lookup/3](http://www.erlang.org/doc/man/inet_res.html#lookup-3). Calling this function through the Erlang repl would look like:

    $ erl
    Erlang/OTP 17 [erts-6.4] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]
    
    Eshell V6.4  (abort with ^G)
    1> inet_res:lookup("erlang.com", in, mx).
    [{20,"mail.erlang.com"}]

My limited knowledge of Erlang pretty much does include the syntax, so I can break this down. 

  * `inet_res` is the module name
  * `lookup` is the function name, and `lookup/3` is the 3 argument version of the function
  * `"erlang.com"` is a string
  * `in` and `mx` are atoms

And it returns the MX records for the erlang.com domain!

This should be pretty easy to convert to Elixir, right? I found the [calling functions portion of the Erlang/Elixir guide](http://elixir-lang.org/crash-course.html#calling-functions) and reading this tells us:

    Note. Since Erlang modules are represented by atoms, you may invoke Erlang functions in Elixir as follows:

    :lists.sort [3, 2, 1]

That sounds easy enough! Staring up the Elixir repl and calling this new code:

    $ iex
    Erlang/OTP 17 [erts-6.4] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]
    
    Interactive Elixir (1.0.5) - press Ctrl+C to exit (type h() ENTER for help)
    iex(1)> :inet_res.lookup("erlang.com", :in, :mx)
    []

Hmm...no results. This is odd. This is where my lack of knowledge about both languages really kick in and I waste a few hours of my Sunday hack day to figure out the problem. I finally stumble on [this Stackoverflow question](http://stackoverflow.com/questions/20108421/using-the-httpc-erlang-module-from-elixir) which tells me that single quote vs double quote strings are different. Good to know! I finally decide to read the [appropriate documentation section](http://elixir-lang.org/getting-started/binaries-strings-and-char-lists.html#char-lists). A double quoted value is a string and in Elixir a string "is a UTF-8 encoded binary, and a binary is a bitstring where the number of bits is divisible by 8." A single quoted value is a character list.  Further down on the page is where my lightbulb goes off:

    char lists are used mostly when interfacing with Erlang, in particular old libraries that do not accept binaries as arguments

This seems to be the issue. Let's test it out in the Elixir repl:

    $ iex
    Erlang/OTP 17 [erts-6.4] [source] [64-bit] [smp:4:4] [async-threads:10] [hipe] [kernel-poll:false] [dtrace]
    
    Interactive Elixir (1.0.5) - press Ctrl+C to exit (type h() ENTER for help)
    iex(1)> :inet_res.lookup('erlang.com', :in, :mx)
    [{20, 'mail.erlang.com'}]

Success! We've made a DNS lookup through the Erlang `inet_res:lookup/3` function from Elixir. And we've learned an important lesson about Elixir and Erlang interop!

