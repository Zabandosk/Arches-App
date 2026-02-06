import re
from django_hosts import patterns, host

host_patterns = patterns(
    "",
    host(re.sub(r"_", r"-", r"arches_slocal"), "arches_slocal.urls", name="arches_slocal"),
)
