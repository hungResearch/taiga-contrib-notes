#!/usr/bin/env python
# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.
#
# Copyright (c) 2021-present Kaleidos INC


import versiontools_support
from setuptools import setup, find_packages

setup(
    name = 'taiga-contrib-notes',
    version = ":versiontools:taiga_contrib_notes:",
    description = "The Taiga plugin for note integration",
    long_description = "",
    keywords = 'taiga, note, integration',
    author = 'JHung',
    author_email = 'hung@gmail.com',
    url = 'https://github.com/hungResearch/taiga-contrib-notes',
    license = 'MPL-2',
    include_package_data = True,
    packages = find_packages(),
    install_requires=[],
    setup_requires = [
        'versiontools >= 1.9',
    ],
    classifiers = [
        "Programming Language :: Python",
        'Development Status :: 4 - Beta',
        'Framework :: Django',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: Mozilla Public License 2.0 (MPL 2.0)',
        'Operating System :: OS Independent',
        'Programming Language :: Python',
        'Topic :: Internet :: WWW/HTTP',
    ]
)