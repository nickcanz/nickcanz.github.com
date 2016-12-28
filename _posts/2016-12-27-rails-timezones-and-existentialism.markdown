---
layout: post
title:  "Rails, timezones, and existentialism"
date:   2016-12-27 23:31:00
categories: ruby rails timezone
---


As part of my day job working on [Postmark](https://postmarkapp.com), we encountered an odd issue in our Rails app. After a bunch of debugging and narrowing down the problem, we got it to the simplest example we could get.

{% highlight ruby %}
Date.today.today?
=> false
{% endhighlight %}

What's this? Today isn't today?

Luckily, Ruby and Rails are open source. So, we can do some digging and figure out wtf is going on.

Let's see what's going on in [`Date.today`](https://ruby-doc.org/stdlib-2.1.1/libdoc/date/rdoc/Date.html#method-c-today). We see that this method is part of Ruby's standard library, which is written in C. I'm not familiar at all with C, but I found a great [Stackoverflow post by Andrew Marshall](http://stackoverflow.com/a/10219875/282975) which helps explain things. The important part of the code for us to pull out is that `Date.today` uses the [`localtime` function](https://linux.die.net/man/3/localtime), which returns values in the computer's timezone. So, whatever timezone the server is set to, `Date.today` will return that date.

Now, let's take a look at `#today?`. This isn't part of Ruby's standard library, but a part of [Rails](http://api.rubyonrails.org/classes/DateAndTime/Calculations.html#method-i-today-3F).

{% highlight ruby %}
# File activesupport/lib/active_support/core_ext/date_and_time/calculations.rb, line 37
def today?
  to_date == ::Date.current
end
{% endhighlight %}

So, it compares the date of the server's timezone to `::Date.current`. `Date.current` is [also defined in Rails](http://api.rubyonrails.org/classes/Date.html#method-c-current)

{% highlight ruby %}
# File activesupport/lib/active_support/core_ext/date/calculations.rb, line 46
def current
  ::Time.zone ? ::Time.zone.today : ::Date.today
end
{% endhighlight %}

Now, we're getting somewhere. If a time zone is set, then `#today?` compares the server's date to a date in an arbitrary timezone. The date of where I'm currently sitting isn't going to be the same date of everyone in the world. 

In our controller logic, we set `Time.zone` equal to the user's preferred timezone. So, for users in Australia who are in a UTC+11 timezone, it was quite often that `#today?` returned false.

For our use case, we updated the code to use `Date.current` instead of `Date.today`. This way date comparisons were all made in the user's timezone and we stopped questioning the meaning of time.


