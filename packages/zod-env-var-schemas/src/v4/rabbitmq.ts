import { z } from "zod";
import { descriptions, messages, patterns } from "../shared/infrastructure";

export const rabbitmqUrl = () =>
  z
    .string()
    .describe(descriptions.rabbitmqUrl)
    .regex(patterns.rabbitmqUrl, {
      message: messages.rabbitmqUrlFormat,
    });

export const RABBITMQ_URL = rabbitmqUrl();