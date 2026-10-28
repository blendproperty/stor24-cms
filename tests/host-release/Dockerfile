FROM ubuntu:24.04
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends openssh-server openssh-client sudo python3 ca-certificates git && rm -rf /var/lib/apt/lists/*
COPY scripts/host-cms-release.py scripts/host-cms-release.sh scripts/install-host-cms-release.sh /staging/
COPY tests/host-release/check.sh /check.sh
COPY tests/host-release/lifecycle.py tests/host-release/docker-fixture.py /staging/
RUN touch /CMS_RELEASE_ISOLATED_FIXTURE
# Only systemd reload is stubbed; SSH authentication and sudo policy are real.
RUN printf '#!/bin/sh\n[ "$1" = reload ] && [ "$2" = ssh ]\n' > /usr/bin/systemctl && chmod 755 /usr/bin/systemctl
CMD ["/bin/bash", "-c", "bash /check.sh && python3 /staging/lifecycle.py"]
